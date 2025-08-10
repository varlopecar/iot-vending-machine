import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRouter } from './orders.router';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [AuthModule, ProductsModule, StocksModule],
  providers: [OrdersService, OrdersRouter],
})
export class OrdersModule {}
