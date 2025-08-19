import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRouter } from './orders.router';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { StocksModule } from '../stocks/stocks.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TrpcAuthMiddleware } from '../auth/trpc-auth.middleware';

@Module({
  imports: [AuthModule, ProductsModule, StocksModule, PrismaModule],
  providers: [OrdersService, OrdersRouter, TrpcAuthMiddleware],
  exports: [OrdersService],
})
export class OrdersModule {}
