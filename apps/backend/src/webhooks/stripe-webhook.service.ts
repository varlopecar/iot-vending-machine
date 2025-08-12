import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { issueQrToken } from '../payments/qr';
import { oncePerOrder } from '../payments/idempotency';
import {
  extractReceiptUrlFromPaymentIntent,
  extractErrorCodeFromPaymentIntent,
  extractErrorMessageFromPaymentIntent,
} from '../payments/stripe-utils';
import type Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  /**
   * Gère un événement Stripe reçu
   * @param event - Événement Stripe validé
   * @returns true si l'événement a été traité avec succès
   */
  async handleEvent(event: Stripe.Event): Promise<boolean> {
    try {
      this.logger.log(
        `Traitement de l'événement ${event.id} de type ${event.type}`,
      );

      // Vérifier la déduplication avant traitement
      const existingEvent = await this.prisma.paymentEvent.findUnique({
        where: { stripe_event_id: event.id },
      });

      if (existingEvent) {
        this.logger.log(`Événement ${event.id} déjà traité, ignoré`);
        return true;
      }

      // Traiter l'événement selon son type
      let success = false;
      switch (event.type) {
        case 'payment_intent.succeeded':
          success = await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          success = await this.handlePaymentIntentFailed(event.data.object);
          break;
        case 'charge.refunded':
          success = await this.handleChargeRefunded(event.data.object);
          break;
        case 'refund.updated':
          success = await this.handleRefundUpdated(event.data.object);
          break;
        default:
          this.logger.log(`Type d'événement non géré: ${event.type}`);
          success = true; // On considère comme traité pour éviter les retries
      }

      // Enregistrer l'événement dans la base de données
      if (success) {
        await this.recordPaymentEvent(event);
      }

      return success;
    } catch (error) {
      this.logger.error(
        `Erreur lors du traitement de l'événement ${event.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Gère un paiement réussi
   * @param paymentIntent - PaymentIntent Stripe
   * @returns true si le traitement a réussi
   */
  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<boolean> {
    try {
      const orderId = paymentIntent.metadata?.orderId;
      if (!orderId) {
        this.logger.warn(
          `PaymentIntent ${paymentIntent.id} sans orderId dans les métadonnées`,
        );
        return false;
      }

      this.logger.log(
        `Traitement du paiement réussi pour la commande ${orderId}`,
      );

      // Récupérer le Payment depuis la base de données
      const payment = await this.prisma.payment.findUnique({
        where: { stripe_payment_intent_id: paymentIntent.id },
        include: { order: true },
      });

      if (!payment) {
        this.logger.warn(
          `Payment introuvable pour PaymentIntent ${paymentIntent.id}`,
        );
        return false;
      }

      // Traitement transactionnel
      await this.prisma.$transaction(async (tx) => {
        // 1. Mettre à jour le Payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'succeeded',
            updated_at: new Date().toISOString(),
          },
        });

        // 2. Mettre à jour l'Order
        const receiptUrl = extractReceiptUrlFromPaymentIntent(paymentIntent);
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            paid_at: new Date().toISOString(),
            receipt_url: receiptUrl,
          },
        });

        // 3. Décrémenter le stock
        await this.inventoryService.decrementStockForOrder(tx, orderId);

        // 4. Générer le QR code token sécurisé avec TTL
        const qrCodeToken = issueQrToken({
          orderId,
          userId: payment.order.user_id,
          machineId: payment.order.machine_id,
        });
        await tx.order.update({
          where: { id: orderId },
          data: { qr_code_token: qrCodeToken },
        });

        // 5. Créditer les points de fidélité (idempotent via order_actions)
        const pointsToAdd = Math.floor(payment.amount_cents / 50);
        if (pointsToAdd > 0) {
          await oncePerOrder(tx, orderId, 'credit_loyalty', async () => {
            await tx.loyaltyLog.create({
              data: {
                user_id: payment.order.user_id,
                change: pointsToAdd,
                reason: `order:${orderId}:paid`,
                created_at: new Date().toISOString(),
              },
            });

            // Mettre à jour les points de l'utilisateur
            await tx.user.update({
              where: { id: payment.order.user_id },
              data: { points: { increment: pointsToAdd } },
            });
          });
        }
      });

      this.logger.log(
        `Commande ${orderId} traitée avec succès: PAID, stock décrémenté, QR généré, points crédités`,
      );

      return true;
    } catch (error) {
      this.logger.error(`Erreur lors du traitement du paiement réussi:`, error);
      throw error;
    }
  }

  /**
   * Gère un échec de paiement
   * @param paymentIntent - PaymentIntent Stripe
   * @returns true si le traitement a réussi
   */
  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<boolean> {
    try {
      const orderId = paymentIntent.metadata?.orderId;
      if (!orderId) {
        this.logger.warn(
          `PaymentIntent ${paymentIntent.id} sans orderId dans les métadonnées`,
        );
        return false;
      }

      this.logger.log(
        `Traitement de l'échec de paiement pour la commande ${orderId}`,
      );

      // Récupérer le Payment depuis la base de données
      const payment = await this.prisma.payment.findUnique({
        where: { stripe_payment_intent_id: paymentIntent.id },
        include: { order: true },
      });

      if (!payment) {
        this.logger.warn(
          `Payment introuvable pour PaymentIntent ${paymentIntent.id}`,
        );
        return false;
      }

      // Extraire les informations d'erreur
      const errorCode = extractErrorCodeFromPaymentIntent(paymentIntent);
      const errorMessage = extractErrorMessageFromPaymentIntent(paymentIntent);

      // Traitement transactionnel
      await this.prisma.$transaction(async (tx) => {
        // 1. Mettre à jour le Payment avec les erreurs
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'failed',
            last_error_code: errorCode,
            last_error_message: errorMessage,
            updated_at: new Date().toISOString(),
          },
        });

        // 2. Mettre à jour l'Order (ne pas toucher au stock)
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'FAILED' },
        });
      });

      this.logger.log(
        `Commande ${orderId} marquée comme échouée: FAILED, erreurs enregistrées`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Erreur lors du traitement de l'échec de paiement:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Gère un remboursement de charge
   * @param charge - Charge Stripe
   * @returns true si le traitement a réussi
   */
  private async handleChargeRefunded(charge: Stripe.Charge): Promise<boolean> {
    try {
      this.logger.log(
        `Événement charge.refunded reçu pour ${charge.id}`,
      );

      if (!charge.payment_intent) {
        this.logger.warn(
          `Charge ${charge.id} sans payment_intent, ignorée`,
        );
        return true;
      }

      // Récupérer le Payment via stripe_payment_intent_id
      const payment = await this.prisma.payment.findUnique({
        where: { stripe_payment_intent_id: charge.payment_intent },
        include: { order: true },
      });

      if (!payment) {
        this.logger.warn(
          `Payment introuvable pour payment_intent ${charge.payment_intent}`,
        );
        return true;
      }

      // Traitement transactionnel
      await this.prisma.$transaction(async (tx) => {
        // Upsert du Refund par stripe_refund_id
        if (charge.refunds?.data?.[0]) {
          const stripeRefund = charge.refunds.data[0];
          await tx.refund.upsert({
            where: { stripe_refund_id: stripeRefund.id },
            create: {
              payment_id: payment.id,
              stripe_refund_id: stripeRefund.id,
              amount_cents: stripeRefund.amount,
              status: stripeRefund.status,
              reason: stripeRefund.reason || 'requested_by_customer',
            },
            update: {
              status: stripeRefund.status,
              amount_cents: stripeRefund.amount,
              reason: stripeRefund.reason || 'requested_by_customer',
            },
          });

          this.logger.log(
            `Refund ${stripeRefund.id} traité pour la commande ${payment.order_id}`,
          );

          // Vérifier si la commande doit passer au statut REFUNDED
          await this.checkAndUpdateOrderRefundStatus(payment.order_id);
        }
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Erreur lors du traitement de charge.refunded:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Gère une mise à jour de remboursement
   * @param refund - Refund Stripe
   * @returns true si le traitement a réussi
   */
  private async handleRefundUpdated(refund: Stripe.Refund): Promise<boolean> {
    try {
      this.logger.log(
        `Événement refund.updated reçu pour ${refund.id}`,
      );

      if (!refund.payment_intent) {
        this.logger.warn(
          `Refund ${refund.id} sans payment_intent, ignoré`,
        );
        return true;
      }

      // Récupérer le Payment via stripe_payment_intent_id
      const payment = await this.prisma.payment.findUnique({
        where: { stripe_payment_intent_id: refund.payment_intent },
        include: { order: true },
      });

      if (!payment) {
        this.logger.warn(
          `Payment introuvable pour payment_intent ${refund.payment_intent}`,
        );
        return true;
      }

      // Traitement transactionnel
      await this.prisma.$transaction(async (tx) => {
        // Upsert du Refund par stripe_refund_id
        await tx.refund.upsert({
          where: { stripe_refund_id: refund.id },
          create: {
            payment_id: payment.id,
            stripe_refund_id: refund.id,
            amount_cents: refund.amount,
            status: refund.status,
            reason: refund.reason || 'requested_by_customer',
          },
          update: {
            status: refund.status,
            amount_cents: refund.amount,
            reason: refund.reason || 'requested_by_customer',
          },
        });

        this.logger.log(
          `Refund ${refund.id} mis à jour pour la commande ${payment.order_id}, statut: ${refund.status}`,
        );

        // Vérifier si la commande doit passer au statut REFUNDED
        await this.checkAndUpdateOrderRefundStatus(payment.order_id);
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Erreur lors du traitement de refund.updated:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Vérifie si une commande doit passer au statut REFUNDED
   */
  private async checkAndUpdateOrderRefundStatus(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: {
          include: {
            refunds: {
              where: { status: 'succeeded' },
            },
          },
        },
      },
    });

    if (!order?.payment) {
      return;
    }

    const totalRefunded = order.payment.refunds.reduce(
      (sum, refund) => sum + refund.amount_cents,
      0,
    );

    // Si le montant total remboursé égale le montant payé, marquer comme remboursé
    if (totalRefunded >= order.payment.amount_cents) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'REFUNDED' },
      });

      this.logger.log(
        `Commande ${orderId} marquée comme remboursée (total remboursé: ${totalRefunded} centimes)`,
      );
    }
  }

  /**
   * Enregistre un événement de paiement dans la base de données
   * @param event - Événement Stripe
   */
  private async recordPaymentEvent(event: Stripe.Event): Promise<void> {
    try {
      // Récupérer le payment_id depuis les métadonnées ou la base
      let paymentId: string | null = null;

      if (event.data.object && 'metadata' in event.data.object) {
        const metadata = (event.data.object as any).metadata;
        if (metadata?.orderId) {
          const order = await this.prisma.order.findUnique({
            where: { id: metadata.orderId },
            select: { payment: { select: { id: true } } },
          });
          paymentId = order?.payment?.id || null;
        }
      }

      if (paymentId) {
        await this.prisma.paymentEvent.create({
          data: {
            payment_id: paymentId,
            stripe_event_id: event.id,
            type: event.type,
            payload: event as any,
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'enregistrement de l'événement ${event.id}:`,
        error,
      );
      // Ne pas faire échouer le traitement principal
    }
  }
}
