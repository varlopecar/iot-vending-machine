import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { JobsService } from './jobs.service';
import { MetricsService } from './metrics.service';
import { z } from 'zod';

@Router({ alias: 'jobs' })
export class JobsRouter {
  constructor(
    private readonly jobsService: JobsService,
    private readonly metricsService: MetricsService,
  ) {}

  @Query({
    output: z.object({
      expireStaleOrders: z.object({
        name: z.string(),
        schedule: z.string(),
        timezone: z.string(),
        description: z.string(),
      }),
      cleanupStalePaymentIntents: z.object({
        name: z.string(),
        schedule: z.string(),
        timezone: z.string(),
        description: z.string(),
      }),
    }),
  })
  getJobsStatus() {
    return this.jobsService.getJobsStatus();
  }

  @Query({
    output: z.object({
      paymentsExpiredTotal: z.number(),
      paymentIntentsCanceledTotal: z.number(),
      stockReleasedTotal: z.number(),
      jobExecutionTime: z.number(),
      lastExecutionTime: z.string(),
    }),
  })
  getJobMetrics() {
    const metrics = this.metricsService.getMetrics();
    return {
      ...metrics,
      lastExecutionTime: metrics.lastExecutionTime.toISOString(),
    };
  }

  @Mutation({
    output: z.object({
      ordersExpired: z.number(),
      paymentIntentsCanceled: z.number(),
      stockReleased: z.number(),
      executionTime: z.number(),
      errors: z.array(z.string()),
    }),
  })
  async runExpireStaleOrdersManually() {
    return await this.jobsService.runExpireStaleOrdersManually();
  }

  @Mutation({
    output: z.object({
      paymentIntentsCanceled: z.number(),
      paymentsUpdated: z.number(),
      executionTime: z.number(),
      errors: z.array(z.string()),
    }),
  })
  async runCleanupStalePaymentIntentsManually() {
    return await this.jobsService.runCleanupStalePaymentIntentsManually();
  }
}
