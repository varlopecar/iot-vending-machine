import { Module } from '@nestjs/common';
import { AnalyticsRouter } from './analytics.router';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AnalyticsRouter, AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
