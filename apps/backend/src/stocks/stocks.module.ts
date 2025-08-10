import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksRouter } from './stocks.router';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [StocksService, StocksRouter],
})
export class StocksModule {}
