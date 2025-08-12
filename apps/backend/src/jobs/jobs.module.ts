import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { ExpireStaleOrdersJob } from './expire-stale-orders.job';
import { CleanupStalePaymentIntentsJob } from './cleanup-stale-payment-intents.job';
import { JobsService } from './jobs.service';
import { JobsRouter } from './jobs.router';
import { MetricsService } from './metrics.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    StripeModule,
  ],
  providers: [
    JobsService,
    ExpireStaleOrdersJob,
    CleanupStalePaymentIntentsJob,
    JobsRouter,
    MetricsService,
  ],
  exports: [JobsService, MetricsService],
})
export class JobsModule {}
