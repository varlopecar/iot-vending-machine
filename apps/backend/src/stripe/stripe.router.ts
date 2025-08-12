import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { StripeService } from './stripe.service';
import { z } from 'zod';
import type { CreatePaymentIntentInput } from './stripe.types';

@Router({ alias: 'stripe' })
export class StripeRouter {
  constructor(private readonly stripeService: StripeService) {}

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
}
