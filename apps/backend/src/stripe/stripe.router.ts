import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { StripeService } from './stripe.service';
import { z } from 'zod';
import { getStripePublishableKey } from './stripeClient';
import type { CreatePaymentIntentInput } from './stripe.types';

@Router({ alias: 'stripe' })
export class StripeRouter {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * MÉTHODES ORIGINALES RESTAURÉES - CRITIQUES POUR LES PAIEMENTS
   */

  @Mutation({
    input: z.object({
      amount: z.number().int().positive(),
      currency: z.string().length(3).default('eur'),
      metadata: z.object({
        order_id: z.string().min(1),
        user_id: z.string().min(1),
        machine_id: z.string().min(1),
      }),
    }),
    output: z.object({
      id: z.string(),
      client_secret: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      metadata: z.record(z.string(), z.string()),
    }),
  })
  createPaymentIntent(@Input() input: CreatePaymentIntentInput) {
    return this.stripeService.createPaymentIntent(input);
  }

  @Query({
    input: z.object({ id: z.string().min(1) }),
    output: z.any(), // Type Stripe natif pour plus de flexibilité
  })
  getPaymentIntent(@Input('id') id: string) {
    return this.stripeService.getPaymentIntent(id);
  }

  @Mutation({
    input: z.object({ id: z.string().min(1) }),
    output: z.any(),
  })
  confirmPaymentIntent(@Input('id') id: string) {
    return this.stripeService.confirmPaymentIntent(id);
  }

  @Mutation({
    input: z.object({ id: z.string().min(1) }),
    output: z.any(),
  })
  cancelPaymentIntent(@Input('id') id: string) {
    return this.stripeService.cancelPaymentIntent(id);
  }

  /**
   * NOUVELLE MÉTHODE AJOUTÉE POUR LA SÉCURITÉ
   * Récupère la clé publique Stripe de manière sécurisée
   * Cette route peut être publique car la clé publique n'est pas sensible
   * @returns Clé publique Stripe
   */
  @Query({
    input: z.void(),
    output: z.object({
      publishableKey: z.string(),
    }),
  })
  getPublishableKey() {
    try {
      const publishableKey = getStripePublishableKey();
      
      return {
        publishableKey,
      };
    } catch (error) {
      throw new Error('Configuration Stripe manquante ou invalide');
    }
  }
}