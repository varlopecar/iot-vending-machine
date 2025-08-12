import { Injectable, BadRequestException } from '@nestjs/common';
import { getStripeClient } from './stripeClient';
import type {
  CreatePaymentIntentInput,
  PaymentIntentResult,
  StripeError,
} from './stripe.types';

@Injectable()
export class StripeService {
  private readonly stripe = getStripeClient();

  /**
   * Crée une intention de paiement pour une commande
   */
  async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<PaymentIntentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: input.amount,
        currency: input.currency,
        metadata: input.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      const stripeError = this.handleStripeError(error);
      throw new BadRequestException(
        `Erreur lors de la création de l'intention de paiement: ${stripeError.message}`,
      );
    }
  }

  /**
   * Récupère une intention de paiement par ID
   */
  async getPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      const stripeError = this.handleStripeError(error);
      throw new BadRequestException(
        `Erreur lors de la récupération du paiement: ${stripeError.message}`,
      );
    }
  }

  /**
   * Confirme une intention de paiement
   */
  async confirmPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      const stripeError = this.handleStripeError(error);
      throw new BadRequestException(
        `Erreur lors de la confirmation du paiement: ${stripeError.message}`,
      );
    }
  }

  /**
   * Annule une intention de paiement
   */
  async cancelPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      const stripeError = this.handleStripeError(error);
      throw new BadRequestException(
        `Erreur lors de l'annulation du paiement: ${stripeError.message}`,
      );
    }
  }

  /**
   * Gère les erreurs Stripe et les convertit en format standardisé
   */
  private handleStripeError(error: any): StripeError {
    if (error.type === 'StripeCardError') {
      return {
        type: 'card_error',
        code: error.code || 'card_declined',
        message: error.message || 'Carte refusée',
        decline_code: error.decline_code,
      };
    }

    if (error.type === 'StripeInvalidRequestError') {
      return {
        type: 'invalid_request_error',
        code: error.code || 'invalid_request',
        message: error.message || 'Requête invalide',
      };
    }

    if (error.type === 'StripeAPIError') {
      return {
        type: 'api_error',
        code: error.code || 'api_error',
        message: error.message || 'Erreur API Stripe',
      };
    }

    // Erreur générique
    return {
      type: 'unknown_error',
      code: 'unknown',
      message: error.message || 'Erreur inconnue',
    };
  }
}
