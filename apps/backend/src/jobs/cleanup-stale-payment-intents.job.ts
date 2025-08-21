import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import {
  runInBatches,
  nowUtc,
  formatDateEuropeParis,
  logLocalPaymentEvent,
  canSafelyCancelPaymentIntent,
  isPaymentIntentFinal,
  getJobStatusInfo,
} from './utils';

export interface CleanupStalePaymentIntentsResult {
  paymentIntentsCanceled: number;
  paymentsUpdated: number;
  errors: string[];
  executionTime: number;
}

@Injectable()
export class CleanupStalePaymentIntentsJob {
  private readonly logger = new Logger(CleanupStalePaymentIntentsJob.name);
  private readonly BATCH_SIZE = 50;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Exécute le job de nettoyage des PaymentIntents obsolètes
   */
  async execute(): Promise<CleanupStalePaymentIntentsResult> {
    const startTime = nowUtc();
    this.logger.log('🚀 Démarrage du job cleanup-stale-payment-intents');

    const result: CleanupStalePaymentIntentsResult = {
      paymentIntentsCanceled: 0,
      paymentsUpdated: 0,
      errors: [],
      executionTime: 0,
    };

    try {
      // Récupérer les PaymentIntents obsolètes
      const stalePayments = await this.getStalePayments();

      if (stalePayments.length === 0) {
        this.logger.log('ℹ️  Aucun PaymentIntent obsolète trouvé');
        return this.finalizeResult(result, startTime);
      }

      this.logger.log(
        `📋 ${stalePayments.length} PaymentIntents obsolètes trouvés`,
      );

      // Traiter les paiements par lots
      await runInBatches(stalePayments, this.BATCH_SIZE, async (batch) => {
        await this.processBatch(batch, result);
      });

      this.logger.log(
        `✅ Traitement terminé: ${result.paymentIntentsCanceled} PIs annulés, ${result.paymentsUpdated} paiements mis à jour`,
      );
    } catch (error) {
      const errorMessage = `Erreur fatale lors de l'exécution du job: ${error.message}`;
      this.logger.error(errorMessage, error);
      result.errors.push(errorMessage);
    }

    return this.finalizeResult(result, startTime);
  }

  /**
   * Récupère les paiements obsolètes
   */
  private async getStalePayments() {
    // Critères pour les paiements obsolètes :
    // 1. Paiements non finalisés (pas succeeded, canceled, failed)
    // 2. Paiements sans commande associée ou commande supprimée
    // 3. Paiements très anciens (plus de 7 jours)
    // 4. Paiements en environnement de test/staging
    const sevenDaysAgo = new Date(nowUtc().getTime() - 7 * 24 * 60 * 60 * 1000);

    return await this.prisma.payment.findMany({
      where: {
        AND: [
          {
            status: {
              notIn: ['succeeded', 'canceled', 'failed'],
            },
          },
          {
            OR: [
              // Les paiements orphelins seraient détectés différemment
              {
                order: {
                  status: {
                    in: ['DELETED', 'ARCHIVED'],
                  },
                },
              },
              {
                created_at: {
                  lt: sevenDaysAgo.toISOString(),
                },
              },
            ],
          },
        ],
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  /**
   * Traite un lot de paiements obsolètes
   */
  private async processBatch(
    payments: any[],
    result: CleanupStalePaymentIntentsResult,
  ): Promise<void> {
    for (const payment of payments) {
      try {
        await this.processStalePayment(payment, result);
      } catch (error) {
        const errorMessage = `Erreur lors du traitement du paiement ${payment.id}: ${error.message}`;
        this.logger.error(errorMessage, error);
        result.errors.push(errorMessage);
      }
    }
  }

  /**
   * Traite un paiement obsolète individuel
   */
  private async processStalePayment(
    payment: any,
    result: CleanupStalePaymentIntentsResult,
  ): Promise<void> {
    this.logger.log(
      `🔄 Traitement du paiement obsolète ${payment.id} (créé le ${formatDateEuropeParis(payment.created_at)})`,
    );

    if (!payment.stripe_payment_intent_id) {
      this.logger.log(
        `ℹ️  Paiement ${payment.id} sans PaymentIntent Stripe, marqué comme annulé`,
      );
      await this.markPaymentAsCanceled(payment, 'no_stripe_pi');
      result.paymentsUpdated++;
      return;
    }

    try {
      // Vérifier le statut sur Stripe
      const stripePI = await this.stripeService.getPaymentIntent(
        payment.stripe_payment_intent_id,
      );

      if (!stripePI) {
        this.logger.log(
          `⚠️  PaymentIntent ${payment.stripe_payment_intent_id} non trouvé sur Stripe`,
        );
        await this.markPaymentAsCanceled(payment, 'stripe_not_found');
        result.paymentsUpdated++;
        return;
      }

      // Vérifier si le PI peut être annulé en toute sécurité
      if (canSafelyCancelPaymentIntent(stripePI.status)) {
        try {
          // Annuler le PI sur Stripe
          await this.stripeService.cancelPaymentIntent(
            payment.stripe_payment_intent_id,
            'abandoned',
          );

          // Mettre à jour le statut du paiement
          await this.markPaymentAsCanceled(payment, 'abandoned');

          result.paymentIntentsCanceled++;
          result.paymentsUpdated++;

          this.logger.log(
            `✅ PaymentIntent ${payment.stripe_payment_intent_id} annulé avec succès`,
          );
        } catch (cancelError) {
          this.logger.error(
            `❌ Erreur lors de l'annulation du PaymentIntent ${payment.stripe_payment_intent_id}:`,
            cancelError,
          );

          // Marquer quand même comme annulé localement
          await this.markPaymentAsCanceled(payment, 'cancel_failed');
          result.paymentsUpdated++;
        }
      } else if (isPaymentIntentFinal(stripePI.status)) {
        // Le PI est dans un état final, synchroniser le statut
        this.logger.log(
          `ℹ️  PaymentIntent ${payment.stripe_payment_intent_id} dans un état final: ${stripePI.status}`,
        );

        await this.syncPaymentStatus(payment, stripePI.status);
        result.paymentsUpdated++;
      } else {
        this.logger.log(
          `ℹ️  PaymentIntent ${payment.stripe_payment_intent_id} dans un état non annulable: ${stripePI.status}`,
        );
      }
    } catch (stripeError) {
      this.logger.error(
        `❌ Erreur Stripe pour le paiement ${payment.id}:`,
        stripeError,
      );

      // Marquer comme annulé en cas d'erreur Stripe
      await this.markPaymentAsCanceled(payment, 'stripe_error');
      result.paymentsUpdated++;
    }
  }

  /**
   * Marque un paiement comme annulé
   */
  private async markPaymentAsCanceled(
    payment: any,
    reason: string,
  ): Promise<void> {
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'canceled',
        last_error_message: reason,
      },
    });

    // Logger l'événement local
    await logLocalPaymentEvent(
      this.prisma,
      'local.payment.canceled',
      {
        paymentId: payment.id,
        orderId: payment.order_id,
        canceledReason: reason,
        canceledBy: 'cleanup-stale-payment-intents-job',
      },
      payment.order_id,
    );
  }

  /**
   * Synchronise le statut d'un paiement avec Stripe
   */
  private async syncPaymentStatus(
    payment: any,
    stripeStatus: string,
  ): Promise<void> {
    const statusMapping: Record<string, string> = {
      succeeded: 'succeeded',
      canceled: 'canceled',
      failed: 'failed',
    };

    const newStatus = statusMapping[stripeStatus] || payment.status;

    if (newStatus !== payment.status) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
        },
      });

      this.logger.log(
        `🔄 Statut du paiement ${payment.id} synchronisé: ${payment.status} → ${newStatus}`,
      );
    }
  }

  /**
   * Finalise le résultat du job
   */
  private finalizeResult(
    result: CleanupStalePaymentIntentsResult,
    startTime: Date,
  ): CleanupStalePaymentIntentsResult {
    const endTime = nowUtc();
    result.executionTime = endTime.getTime() - startTime.getTime();

    const statusInfo = getJobStatusInfo(
      'cleanup-stale-payment-intents',
      startTime,
      endTime,
      result.errors.length === 0,
      result,
    );

    this.logger.log("📊 Résumé de l'exécution:", statusInfo);

    return result;
  }

  /**
   * Exécute le job en mode manuel (pour les tests)
   */
  async executeManually(): Promise<CleanupStalePaymentIntentsResult> {
    this.logger.log(
      '🔄 Exécution manuelle du job cleanup-stale-payment-intents',
    );
    return await this.execute();
  }
}
