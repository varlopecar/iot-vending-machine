import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { LoyaltyService } from './loyalty.service';
import { z } from 'zod';
import {
  loyaltyLogSchema,
  advantageSchema,
  historyEntrySchema,
} from './loyalty.schema';

@Router({ alias: 'loyalty' })
export class LoyaltyRouter {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Query({
    input: z.object({ user_id: z.uuid() }),
    output: z.number(),
  })
  getCurrentPoints(@Input('user_id') userId: string) {
    return this.loyaltyService.getCurrentPoints(userId);
  }

  @Query({
    input: z.object({ user_id: z.uuid() }),
    output: z.array(loyaltyLogSchema),
  })
  getLoyaltyHistory(@Input('user_id') userId: string) {
    return this.loyaltyService.getLoyaltyHistory(userId);
  }

  @Query({
    input: z.object({ user_id: z.uuid() }),
    output: z.array(historyEntrySchema),
  })
  getLoyaltyHistoryFormatted(@Input('user_id') userId: string) {
    return this.loyaltyService.getLoyaltyHistoryFormatted(userId);
  }

  @Query({
    output: z.array(advantageSchema),
  })
  getAvailableAdvantages() {
    return this.loyaltyService.getAvailableAdvantages();
  }

  @Mutation({
    input: z.object({
      user_id: z.uuid(),
      points: z.number().int().positive(),
      reason: z.string(),
    }),
    output: loyaltyLogSchema,
  })
  addPoints(
    @Input('user_id') userId: string,
    @Input('points') points: number,
    @Input('reason') reason: string,
  ) {
    return this.loyaltyService.addPoints(userId, points, reason);
  }

  @Mutation({
    input: z.object({
      user_id: z.uuid(),
      points: z.number().int().positive(),
      reason: z.string(),
    }),
    output: loyaltyLogSchema,
  })
  deductPoints(
    @Input('user_id') userId: string,
    @Input('points') points: number,
    @Input('reason') reason: string,
  ) {
    return this.loyaltyService.deductPoints(userId, points, reason);
  }

  @Mutation({
    input: z.object({
      user_id: z.uuid(),
      advantage_id: z.string(),
    }),
    output: loyaltyLogSchema,
  })
  redeemAdvantage(
    @Input('user_id') userId: string,
    @Input('advantage_id') advantageId: string,
  ) {
    return this.loyaltyService.redeemAdvantage(userId, advantageId);
  }
}
