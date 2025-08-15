import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksRouter } from './stocks.router';
import { ProductsModule } from '../products/products.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [ProductsModule, AlertsModule],
  providers: [StocksService, StocksRouter],
  exports: [StocksService],
})
export class StocksModule {}
