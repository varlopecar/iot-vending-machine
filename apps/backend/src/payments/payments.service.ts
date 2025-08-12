import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getStripeClient } from '../stripe/stripeClient';
import { TRPCError } from '@trpc/server';
import type Stripe from 'stripe';

export interface CreateRefundInput {
  orderId: string;
  amountCents?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface CreateRefundResult {
  refundId: string;
  stripeRefundId: string;
  status: string;
  amountCents: number;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe = getStripeClient();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée un remboursement pour une commande
   */
  async createRefund(input: CreateRefundInput): Promise<CreateRefundResult> {
    const { orderId, amountCents, reason } = input;

    // 1. Charger order -> payment et vérifier le statut
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Commande ${orderId} introuvable`,
      });
    }

    if (!order.payment) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Aucun paiement trouvé pour la commande ${orderId}`,
      });
    }

    if (order.payment.status !== 'succeeded') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Le paiement doit être en statut 'succeeded' pour être remboursé. Statut actuel: ${order.payment.status}`,
      });
    }

    // 2. Calculer le montant remboursable
    const refundableAmount = await this.computeRefundableAmount(
      order.payment.id,
    );

    if (refundableAmount <= 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Aucun montant remboursable pour la commande ${orderId}`,
      });
    }

    const refundAmount = amountCents || refundableAmount;

    if (refundAmount > refundableAmount) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Le montant de remboursement (${refundAmount} centimes) ne peut pas dépasser le montant remboursable (${refundableAmount} centimes)`,
      });
    }

    if (refundAmount <= 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Le montant de remboursement doit être positif',
      });
    }

    try {
      // 3. Appeler Stripe pour créer le remboursement
      const stripeRefund = await this.stripe.refunds.create({
        payment_intent: order.payment.stripe_payment_intent_id,
        amount: refundAmount,
        reason: reason || 'requested_by_customer',
        metadata: {
          order_id: orderId,
          payment_id: order.payment.id,
        },
      });

      // 4. Créer l'enregistrement en BDD
      const refund = await this.prisma.refund.create({
        data: {
          payment_id: order.payment.id,
          stripe_refund_id: stripeRefund.id,
          amount_cents: refundAmount,
          status: 'pending', // Stripe met à jour le statut via webhook
          reason: reason || 'requested_by_customer',
        },
      });

      this.logger.log(
        `Remboursement créé: ${refund.id} pour la commande ${orderId}, montant: ${refundAmount} centimes`,
      );

      return {
        refundId: refund.id,
        stripeRefundId: refund.stripe_refund_id,
        status: refund.status,
        amountCents: refund.amount_cents,
      };
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création du remboursement pour la commande ${orderId}:`,
        error,
      );

      // Vérifier si c'est une erreur Stripe
      if (error && typeof error === 'object' && 'type' in error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erreur Stripe: ${(error as any).message || 'Erreur inconnue'}`,
          cause: error,
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la création du remboursement',
        cause: error,
      });
    }
  }

  /**
   * Calcule le montant remboursable pour un paiement
   */
  async computeRefundableAmount(paymentId: string): Promise<number> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        refunds: {
          where: { status: 'succeeded' },
        },
      },
    });

    if (!payment) {
      return 0;
    }

    const totalRefunded = payment.refunds.reduce(
      (sum, refund) => sum + refund.amount_cents,
      0,
    );

    return payment.amount_cents - totalRefunded;
  }

  /**
   * Met à jour le statut d'un remboursement
   */
  async updateRefundStatus(
    stripeRefundId: string,
    status: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.prisma.refund.update({
      where: { stripe_refund_id: stripeRefundId },
      data: {
        status,
        ...metadata,
      },
    });

    this.logger.log(
      `Statut du remboursement ${stripeRefundId} mis à jour: ${status}`,
    );
  }

  /**
   * Vérifie si une commande doit passer au statut REFUNDED
   */
  async checkAndUpdateOrderRefundStatus(orderId: string): Promise<void> {
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
}
