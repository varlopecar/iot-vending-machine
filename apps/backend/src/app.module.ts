import { Module } from '@nestjs/common';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
