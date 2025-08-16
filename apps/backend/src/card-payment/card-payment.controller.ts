import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { getStripeClient } from '../stripe/stripeClient';
import { z } from 'zod';

// Schema de validation pour les données de carte bancaire
const cardPaymentSchema = z.object({
  number: z.string().regex(/^\d{13,19}$/, 'Numéro de carte invalide'),
  exp_month: z.number().int().min(1).max(12),
  exp_year: z.number().int().min(new Date().getFullYear()),
  cvc: z.string().regex(/^\d{3,4}$/, 'CVC invalide'),
  country: z.string().min(2).max(3),
  amount: z.number().int().positive(),
  currency: z.string().length(3).default('eur'),
  metadata: z
    .object({
      order_id: z.string().optional(),
      user_id: z.string().optional(),
      machine_id: z.string().optional(),
    })
    .optional(),
});

type CardPaymentInput = z.infer<typeof cardPaymentSchema>;

@Controller('api/card-payment')
export class CardPaymentController {
  private readonly stripe = getStripeClient();

  constructor(private readonly stripeService: StripeService) {}

  @Post('process')
  async processCardPayment(@Body() body: CardPaymentInput) {
    try {
      // Validation des données d'entrée
      const validatedData = cardPaymentSchema.parse(body);

      // Créer un payment method avec les informations de carte
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: validatedData.number,
          exp_month: validatedData.exp_month,
          exp_year: validatedData.exp_year,
          cvc: validatedData.cvc,
        },
        billing_details: {
          address: {
            country: validatedData.country,
          },
        },
      });

      // Créer une payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: validatedData.amount,
        currency: validatedData.currency,
        payment_method: paymentMethod.id,
        confirmation_method: 'manual',
        confirm: true,
        return_url: 'https://your-app.com/return', // À adapter selon vos besoins
        metadata: validatedData.metadata || {},
      });

      // Vérifier le statut du paiement
      if (paymentIntent.status === 'succeeded') {
        return {
          status: 'PAYMENT_SUCCESSFUL',
          payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          created: paymentIntent.created,
          metadata: paymentIntent.metadata,
        };
      } else if (paymentIntent.status === 'requires_action') {
        // Certaines cartes nécessitent une authentification 3D Secure
        return {
          status: 'PAYMENT_REQUIRES_ACTION',
          payment_intent_id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          next_action: paymentIntent.next_action,
        };
      } else {
        return {
          status: 'PAYMENT_DECLINED',
          payment_intent_id: paymentIntent.id,
          failure_reason:
            paymentIntent.last_payment_error?.message || 'Paiement refusé',
        };
      }
    } catch (error) {


      // Gestion des erreurs Stripe spécifiques
      if (
        error &&
        typeof error === 'object' &&
        'type' in error &&
        (error as any).type === 'StripeCardError'
      ) {
        const stripeError = error as {
          code?: string;
          message?: string;
          decline_code?: string;
        };
        return {
          status: 'PAYMENT_DECLINED',
          error_code: stripeError.code || 'unknown',
          error_message: stripeError.message || 'Erreur de carte',
          decline_code: stripeError.decline_code || 'unknown',
        };
      }

      // Gestion des erreurs de validation
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          status: 'VALIDATION_ERROR',
          errors: error.issues,
        });
      }

      // Autres erreurs
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      throw new HttpException(
        {
          status: 'PAYMENT_ERROR',
          message: 'Erreur lors du traitement du paiement',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('test')
  async testPayment() {
    // Route de test avec des données de carte de test Stripe
    const testCardData = {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 2025,
      cvc: '123',
      country: 'FR',
      amount: 2000, // 20.00 EUR
      currency: 'eur',
      metadata: {
        order_id: 'test_order_123',
        user_id: 'test_user_456',
        machine_id: 'test_machine_789',
      },
    };

    return this.processCardPayment(testCardData);
  }
}
