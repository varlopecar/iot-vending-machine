import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { MachinesModule } from './machines/machines.module';
import { StocksModule } from './stocks/stocks.module';
import { PickupsModule } from './pickups/pickups.module';
import { StripeModule } from './stripe/stripe.module';
import { CheckoutModule } from './checkout/checkout.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { InventoryModule } from './inventory/inventory.module';
import { PaymentsModule } from './payments/payments.module';
import { JobsModule } from './jobs/jobs.module';
import { HealthModule } from './health/health.module';
import { CardPaymentModule } from './card-payment/card-payment.module';
import { OrderValidationModule } from './order-validation/order-validation.module';
import { OrderDeliveryModule } from './order-delivery/order-delivery.module';
import { RestocksModule } from './restocks/restocks.module';
import { AlertsModule } from './alerts/alerts.module';
import { PaymentMonitoringMiddleware } from './payments/payment-monitoring.middleware';

@Module({
  imports: [
    PrismaModule,
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/globals/trpc/src/server',
    }),
    AuthModule,
    ProductsModule,
    OrdersModule,
    LoyaltyModule,
    MachinesModule,
    StocksModule,
    PickupsModule,
    StripeModule,
    CheckoutModule,
    WebhooksModule,
    InventoryModule,
    PaymentsModule,
    // JobsModule, // Temporairement désactivé pour résoudre le conflit ScheduleModule
    HealthModule,
    CardPaymentModule,
    OrderValidationModule,
    OrderDeliveryModule,
    RestocksModule,
    AlertsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PaymentMonitoringMiddleware).forRoutes('*');
  }
}
