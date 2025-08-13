import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { ReservationsService } from '../inventory/reservations.service';
import {
  runInBatches,
  nowUtc,
  formatDateEuropeParis,
  logLocalPaymentEvent,
  canSafelyCancelPaymentIntent,
  getJobStatusInfo,
} from './utils';

export interface ExpireStaleOrdersResult {
  ordersExpired: number;
  paymentIntentsCanceled: number;
  stockReleased: number;
  errors: string[];
  executionTime: number;
}

@Injectable()
export class ExpireStaleOrdersJob {
  private readonly logger = new Logger(ExpireStaleOrdersJob.name);
  private readonly BATCH_SIZE = 100;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly reservationsService: ReservationsService,
  ) {}

  /**
   * Exécute le job d'expiration des commandes non payées
   */
  async execute(): Promise<ExpireStaleOrdersResult> {
    const startTime = nowUtc();
    this.logger.log('🚀 Démarrage du job expire-stale-orders');

    const result: ExpireStaleOrdersResult = {
      ordersExpired: 0,
      paymentIntentsCanceled: 0,
      stockReleased: 0,
      errors: [],
      executionTime: 0,
    };

    try {
      // Récupérer les commandes expirées
      const expiredOrders = await this.getExpiredOrders();

      if (expiredOrders.length === 0) {
        this.logger.log('ℹ️  Aucune commande expirée trouvée');
        return this.finalizeResult(result, startTime);
      }

      this.logger.log(`📋 ${expiredOrders.length} commandes expirées trouvées`);

      // Traiter les commandes par lots
      await runInBatches(expiredOrders, this.BATCH_SIZE, async (batch) => {
        await this.processBatch(batch, result);
      });

      this.logger.log(
        `✅ Traitement terminé: ${result.ordersExpired} commandes expirées, ${result.paymentIntentsCanceled} PIs annulés`,
      );
    } catch (error) {
      const errorMessage = `Erreur fatale lors de l'exécution du job: ${error.message}`;
      this.logger.error(errorMessage, error);
      result.errors.push(errorMessage);
    }

    return this.finalizeResult(result, startTime);
  }

  /**
   * Récupère les commandes expirées
   */
  private async getExpiredOrders() {
    return await this.prisma.order.findMany({
      where: {
        status: {
          in: ['PENDING', 'REQUIRES_PAYMENT'],
        },
        expires_at: {
          lt: nowUtc().toISOString(),
        },
      },
      include: {
        items: true,
        payment: true,
      },
      orderBy: {
        expires_at: 'asc',
      },
    });
  }

  /**
   * Traite un lot de commandes expirées
   */
  private async processBatch(
    orders: any[],
    result: ExpireStaleOrdersResult,
  ): Promise<void> {
    for (const order of orders) {
      try {
        await this.processExpiredOrder(order, result);
      } catch (error) {
        const errorMessage = `Erreur lors du traitement de la commande ${order.id}: ${error.message}`;
        this.logger.error(errorMessage, error);
        result.errors.push(errorMessage);
      }
    }
  }

  /**
   * Traite une commande expirée individuelle
   */
  private async processExpiredOrder(
    order: any,
    result: ExpireStaleOrdersResult,
  ): Promise<void> {
    this.logger.log(
      `🔄 Traitement de la commande expirée ${order.id} (expirée le ${formatDateEuropeParis(order.expires_at)})`,
    );

    await this.prisma.$transaction(async (tx) => {
      // 1. Marquer la commande comme expirée
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'EXPIRED',
        },
      });

      // 2. Libérer les réservations de stock
      const stockReleased =
        await this.reservationsService.releaseReservedStockForOrder(
          tx,
          order.id,
        );
      result.stockReleased += stockReleased;

      // 3. Annuler les PaymentIntents Stripe si possible
      const pisCanceled = await this.cancelStalePaymentIntents(order, tx);
      result.paymentIntentsCanceled += pisCanceled;

      // 4. Logger l'événement local
      await logLocalPaymentEvent(
        tx,
        'local.order.expired',
        {
          orderId: order.id,
          expiredAt: order.expires_at,
          stockReleased,
          paymentIntentsCanceled: pisCanceled,
        },
        order.id,
      );
    });

    result.ordersExpired++;
    this.logger.log(`✅ Commande ${order.id} traitée avec succès`);
  }

  /**
   * Annule les PaymentIntents Stripe obsolètes
   */
  private async cancelStalePaymentIntents(
    order: any,
    tx: any,
  ): Promise<number> {
    let canceledCount = 0;

    // Vérifier s'il y a un paiement associé
    if (!order.payment) {
      return 0;
    }

    const payment = order.payment;
    try {
        if (
          payment.stripe_payment_intent_id &&
          canSafelyCancelPaymentIntent(payment.status)
        ) {
          // Vérifier si le PI existe encore sur Stripe
          try {
            const stripePI = await this.stripeService.getPaymentIntent(
              payment.stripe_payment_intent_id,
            );

            if (stripePI && canSafelyCancelPaymentIntent(stripePI.status)) {
              // Annuler le PI sur Stripe
              await this.stripeService.cancelPaymentIntent(
                payment.stripe_payment_intent_id,
                'abandoned',
              );

              // Mettre à jour le statut du paiement
              await tx.payment.update({
                where: { id: payment.id },
                data: {
                  status: 'canceled',
                  last_error_message: 'Commande expirée - PaymentIntent annulé',
                },
              });

              canceledCount++;
              this.logger.log(
                `💳 PaymentIntent ${payment.stripe_payment_intent_id} annulé avec succès`,
              );
            }
          } catch (stripeError) {
            // Le PI n'existe plus sur Stripe ou erreur d'API
            this.logger.warn(
              `⚠️  Impossible d'annuler le PaymentIntent ${payment.stripe_payment_intent_id}: ${stripeError.message}`,
            );

            // Marquer quand même comme annulé localement
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: 'canceled',
                last_error_message: 'PaymentIntent introuvable sur Stripe',
              },
            });

            canceledCount++;
          }
        }
      } catch (error) {
        this.logger.error(
          `❌ Erreur lors de l'annulation du PaymentIntent pour la commande ${order.id}:`,
          error,
        );
      }

    return canceledCount;
  }

  /**
   * Finalise le résultat du job
   */
  private finalizeResult(
    result: ExpireStaleOrdersResult,
    startTime: Date,
  ): ExpireStaleOrdersResult {
    const endTime = nowUtc();
    result.executionTime = endTime.getTime() - startTime.getTime();

    const statusInfo = getJobStatusInfo(
      'expire-stale-orders',
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
  async executeManually(): Promise<ExpireStaleOrdersResult> {
    this.logger.log('🔄 Exécution manuelle du job expire-stale-orders');
    return await this.execute();
  }
}
