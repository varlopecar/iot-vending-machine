import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsRouter } from './payments.router';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentMonitoringMiddleware } from './payment-monitoring.middleware';
import { PaymentMetricsService } from './payment-metrics.service';
import { PaymentMetricsController } from './payment-metrics.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    PaymentsService,
    PaymentsRouter,
    PaymentMonitoringMiddleware,
    PaymentMetricsService,
  ],
  controllers: [PaymentMetricsController],
  exports: [PaymentsService, PaymentMonitoringMiddleware],
})
export class PaymentsModule {}
