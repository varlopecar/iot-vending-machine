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
      // Vérifier que Stripe est disponible
      if (!this.stripe?.paymentIntents?.create) {
        throw new BadRequestException(
          'Stripe paymentIntents.create method not available',
        );
      }

      // Configuration des méthodes de paiement selon la plateforme
      // Pour les tests, on utilise uniquement automatic_payment_methods
      // TODO: Réactiver Apple Pay/Google Pay quand le compte Stripe sera configuré
      const paymentMethodOptions: any = {
        automatic_payment_methods: {
          enabled: true,
        },
      };

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: input.amount,
        currency: input.currency,
        metadata: input.metadata,
        ...paymentMethodOptions,
      });

      // Déterminer si le support natif est disponible
      const supportsNativePay = this.determineNativePaySupport(input);

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
        supportsNativePay,
        paymentMethodTypes: paymentIntent.payment_method_types || [],
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
  async cancelPaymentIntent(
    paymentIntentId: string,
    cancellationReason?: string,
  ) {
    try {
      const cancelOptions: any = {};
      if (cancellationReason) {
        cancelOptions.cancellation_reason = cancellationReason;
      }

      return await this.stripe.paymentIntents.cancel(
        paymentIntentId,
        cancelOptions,
      );
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

  /**
   * Détermine si le support des paiements natifs est disponible
   */
  private determineNativePaySupport(input: CreatePaymentIntentInput): boolean {
    if (!input.supportsNativePay || !input.platform) {
      return false;
    }

    // Vérifier que la devise est supportée par Apple Pay / Google Pay
    const supportedCurrencies = [
      'eur',
      'usd',
      'gbp',
      'cad',
      'aud',
      'chf',
      'jpy',
    ];
    if (!supportedCurrencies.includes(input.currency.toLowerCase())) {
      return false;
    }

    // Vérifier que le montant est dans les limites acceptables
    if (input.amount < 50 || input.amount > 999999) {
      // 0.50€ à 9999.99€
      return false;
    }

    return true;
  }

  /**
   * Vérifie la disponibilité d'Apple Pay pour un domaine
   */
  async checkApplePayAvailability(domain: string): Promise<boolean> {
    try {
      // Vérifier que Stripe est disponible
      if (!this.stripe?.accounts?.retrieve) {
        console.warn('Stripe accounts.retrieve method not available');
        return false;
      }

      // Apple Pay est généralement disponible si le compte Stripe supporte les paiements
      // et que les capacités sont activées dans le dashboard
      const account = await this.stripe.accounts.retrieve();

      // Vérifier que le compte peut traiter des paiements
      const canProcessPayments = account.charges_enabled === true;

      // Pour une vérification plus poussée, on pourrait aussi vérifier
      // les capabilities du compte pour Apple Pay
      return canProcessPayments;
    } catch (error) {
      console.warn('Erreur lors de la vérification Apple Pay:', error);
      return false;
    }
  }

  /**
   * Vérifie la disponibilité de Google Pay
   */
  async checkGooglePayAvailability(): Promise<boolean> {
    try {
      // Vérifier que Stripe est disponible
      if (!this.stripe?.accounts?.retrieve) {
        console.warn('Stripe accounts.retrieve method not available');
        return false;
      }

      // Google Pay est généralement disponible si configuré dans le dashboard Stripe
      const account = await this.stripe.accounts.retrieve();
      return account.charges_enabled === true;
    } catch (error) {
      console.warn('Erreur lors de la vérification Google Pay:', error);
      return false;
    }
  }
}
