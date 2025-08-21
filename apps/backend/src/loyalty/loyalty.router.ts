import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { LoyaltyService } from './loyalty.service';
import { z } from 'zod';
import {
  advantageSchema,
  historyEntrySchema,
  historyPagedResponseSchema,
} from './loyalty.schema';

@Router({ alias: 'loyalty' })
export class LoyaltyRouter {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Query({
    input: z.object({ user_id: z.string().min(1) }),
    output: z.number(),
  })
  getCurrentPoints(@Input('user_id') userId: string) {
    return this.loyaltyService.getCurrentPoints(userId);
  }

  @Query({
    input: z.object({ user_id: z.string().min(1) }),
    output: z.array(historyEntrySchema),
  })
  getLoyaltyHistory(@Input('user_id') userId: string) {
    return this.loyaltyService.getLoyaltyHistoryFormatted(userId);
  }

  @Query({
    input: z.object({ user_id: z.string().min(1) }),
    output: z.array(historyEntrySchema),
  })
  getLoyaltyHistoryFormatted(@Input('user_id') userId: string) {
    return this.loyaltyService.getLoyaltyHistoryFormatted(userId);
  }

  // Pagination simple avec offset/limit
  @Query({
    input: z.object({
      user_id: z.string().min(1),
      offset: z.number().int().min(0).default(0),
      limit: z.number().int().min(1).max(100).default(20),
    }),
    output: historyPagedResponseSchema,
  })
  async getLoyaltyHistoryPaged(
    @Input('user_id') userId: string,
    @Input('offset') offset: number,
    @Input('limit') limit: number,
  ) {
    return this.loyaltyService.getLoyaltyHistoryPaged(userId, offset, limit);
  }

  @Query({
    output: z.array(advantageSchema),
  })
  getAvailableAdvantages() {
    return this.loyaltyService.getAvailableAdvantages();
  }

  @Mutation({
    input: z.object({
      user_id: z.string().min(1),
      points: z.number().int().positive(),
      reason: z.string(),
    }),
    output: historyEntrySchema,
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
      user_id: z.string().min(1),
      points: z.number().int().positive(),
      reason: z.string(),
    }),
    output: historyEntrySchema,
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
      user_id: z.string().min(1),
      advantage_id: z.string(),
    }),
    output: historyEntrySchema,
  })
  redeemAdvantage(
    @Input('user_id') userId: string,
    @Input('advantage_id') advantageId: string,
  ) {
    return this.loyaltyService.redeemAdvantage(userId, advantageId);
  }
}
