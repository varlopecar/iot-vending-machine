import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  getStripeClient,
  getStripePublishableKey,
} from '../stripe/stripeClient';
import type {
  CreateIntentInput,
  CreateIntentResponse,
  GetStatusInput,
  GetStatusResponse,
  PayableOrderStatus,
} from './checkout.schema';
import Stripe from 'stripe';
// finalizePayment retiré → imports non nécessaires

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly stripe = getStripeClient();
  private readonly publishableKey = getStripePublishableKey();

  /**
   * Crée une intention de paiement Stripe pour une commande
   * @param input - Données d'entrée contenant l'ID de la commande
   * @param currentUserId - ID de l'utilisateur authentifié
   * @returns Informations de paiement pour le client mobile
   */
  async createIntent(
    input: CreateIntentInput,
    currentUserId: string,
  ): Promise<CreateIntentResponse> {
    try {
      // 1. Charger la commande avec ses items
      const order = await this.prisma.order.findUnique({
        where: { id: input.orderId },
        include: { items: true, user: true },
      });

      if (!order) {
        throw new NotFoundException('Commande introuvable');
      }

      // 2. Vérifier l'ownership
      if (order.user_id !== currentUserId) {
        throw new ForbiddenException('Accès non autorisé à cette commande');
      }

      // 3. Vérifier le statut de la commande
      if (!this.isPayableStatus(order.status)) {
        throw new BadRequestException(
          `Le statut de la commande (${order.status}) ne permet pas le paiement`,
        );
      }

      // 4. Vérifier l'expiration
      if (order.expires_at && new Date(order.expires_at) < new Date()) {
        throw new BadRequestException('La commande a expiré');
      }

      // 5. Recalculer le montant depuis les snapshots
      const calculatedAmount = order.items.reduce(
        (sum, item) => sum + item.subtotal_cents,
        0,
      );

      if (calculatedAmount <= 0) {
        throw new BadRequestException(
          'Le montant de la commande doit être supérieur à 0',
        );
      }

      // 6. Mettre à jour le montant si différent
      if (calculatedAmount !== order.amount_total_cents) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { amount_total_cents: calculatedAmount },
        });
      }

      // 7. Gérer le customer Stripe
      let stripeCustomerId = order.user.stripe_customer_id;

      if (!stripeCustomerId) {
        const customer = await this.stripe.customers.create({
          email: order.user.email,
          metadata: { userId: order.user.id },
        });

        stripeCustomerId = customer.id;

        // Persister l'ID du customer
        await this.prisma.user.update({
          where: { id: order.user.id },
          data: { stripe_customer_id: stripeCustomerId },
        });
      }

      // 8. Créer l'intention de paiement avec idempotence
      const paymentIntent = await this.stripe.paymentIntents.create(
        {
          amount: calculatedAmount,
          currency: order.currency.toLowerCase(),
          customer: stripeCustomerId,
          automatic_payment_methods: { enabled: true },
          metadata: {
            orderId: order.id,
            userId: currentUserId,
          },
        },
        {
          idempotencyKey: `order:${order.id}`,
        },
      );

      // 9. Créer la clé éphémère
      const ephemeralKey = await this.stripe.ephemeralKeys.create(
        { customer: stripeCustomerId },
        { apiVersion: process.env.STRIPE_API_VERSION || '2024-06-20' },
      );

      // 10. Upsert Payment et mettre à jour Order
      await this.prisma.$transaction(async (tx) => {
        // Upsert Payment
        await tx.payment.upsert({
          where: { order_id: order.id },
          update: {
            stripe_payment_intent_id: paymentIntent.id,
            amount_cents: calculatedAmount,
            currency: order.currency,
            status: paymentIntent.status,
            updated_at: new Date().toISOString(),
          },
          create: {
            order_id: order.id,
            stripe_payment_intent_id: paymentIntent.id,
            amount_cents: calculatedAmount,
            currency: order.currency,
            status: paymentIntent.status,
          },
        });

        // Mettre à jour Order
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'REQUIRES_PAYMENT',
            stripe_payment_intent_id: paymentIntent.id,
          },
        });
      });

      // 11. Retourner les informations de paiement
      return {
        publishableKey: this.publishableKey,
        paymentIntentClientSecret: paymentIntent.client_secret!,
        customerId: stripeCustomerId,
        ephemeralKey: ephemeralKey.secret!,
      };
    } catch (error) {
      // Gestion des erreurs Stripe
      if (error instanceof Stripe.errors.StripeError) {
        this.handleStripeError(error, input.orderId);
      }

      // Remonter les erreurs métier
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      // Erreur interne

      throw new BadRequestException(
        "Erreur lors de la création de l'intention de paiement",
      );
    }
  }

  /**
   * Récupère le statut consolidé d'une commande
   * @param input - Données d'entrée contenant l'ID de la commande
   * @param currentUserId - ID de l'utilisateur authentifié
   * @returns Statut consolidé de la commande et du paiement
   */
  async getStatus(
    input: GetStatusInput,
    currentUserId: string,
  ): Promise<GetStatusResponse> {
    try {
      // Charger la commande avec ses relations
      const order = await this.prisma.order.findUnique({
        where: { id: input.orderId },
        include: {
          payment: true,
          user: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Commande introuvable');
      }

      // Vérifier l'ownership
      if (order.user_id !== currentUserId) {
        throw new ForbiddenException('Accès non autorisé à cette commande');
      }

      return {
        orderStatus: order.status,
        paymentStatus: order.payment?.status || null,
        paidAt: order.paid_at || null,
        receiptUrl: order.receipt_url || null,
        amountTotalCents: order.amount_total_cents,
        currency: order.currency,
        qrCodeToken: order.qr_code_token || null,
        stripePaymentIntentId: order.stripe_payment_intent_id || null,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new BadRequestException('Erreur lors de la récupération du statut');
    }
  }

  // finalizePayment supprimé (retour en arrière)

  /**
   * Vérifie si le statut de la commande permet le paiement
   */
  private isPayableStatus(status: string): status is PayableOrderStatus {
    return ['PENDING', 'FAILED'].includes(status);
  }

  /**
   * Gère les erreurs Stripe et les convertit en erreurs métier
   */
  private handleStripeError(
    error: Stripe.errors.StripeError,
    orderId: string,
  ): never {
    switch (error.type) {
      case 'StripeInvalidRequestError':
        throw new BadRequestException('Données de paiement invalides');

      case 'StripeAuthenticationError':
        throw new BadRequestException("Erreur d'authentification Stripe");

      case 'StripeRateLimitError':
        throw new BadRequestException('Limite de taux Stripe dépassée');

      case 'StripeAPIError':
        throw new BadRequestException('Erreur API Stripe');

      case 'StripeConnectionError':
        throw new BadRequestException('Erreur de connexion Stripe');

      default:
        throw new BadRequestException('Erreur de paiement inattendue');
    }
  }
}
