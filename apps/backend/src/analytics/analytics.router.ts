import { Query, Router } from 'nestjs-trpc';
import { AnalyticsService } from './analytics.service';
import { 
  popularProductSchema, 
  topMachineRevenueSchema,
  currentMonthAnalyticsSchema,
  dashboardStatsSchema
} from './analytics.schema';
import { z } from 'zod';

@Router({ alias: 'analytics' })
export class AnalyticsRouter {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Query({
    output: z.array(popularProductSchema),
  })
  async getPopularProductsCurrentMonth() {
    return this.analyticsService.getPopularProductsCurrentMonth();
  }

  @Query({
    output: z.array(topMachineRevenueSchema),
  })
  async getTopMachinesByRevenueCurrentMonth() {
    return this.analyticsService.getTopMachinesByRevenueCurrentMonth();
  }

  @Query({
    output: currentMonthAnalyticsSchema,
  })
  async getCurrentMonthAnalytics() {
    return this.analyticsService.getCurrentMonthAnalytics();
  }

  @Query({
    output: dashboardStatsSchema,
  })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }
}
