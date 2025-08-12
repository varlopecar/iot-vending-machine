import { z } from 'zod';
import { Input, Mutation, Router } from 'nestjs-trpc';
import { PaymentsService } from './payments.service';
import type { CreateRefundInput } from './payments.service';

@Router({ alias: 'payments' })
export class PaymentsRouter {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation({
    input: z.object({
      orderId: z.string().uuid(),
      amountCents: z.number().int().positive().optional(),
      reason: z
        .enum(['duplicate', 'fraudulent', 'requested_by_customer'])
        .optional(),
    }),
    output: z.object({
      refundId: z.string(),
      stripeRefundId: z.string(),
      status: z.string(),
      amountCents: z.number(),
    }),
  })
  refund(@Input() input: CreateRefundInput) {
    return this.paymentsService.createRefund(input);
  }
}
