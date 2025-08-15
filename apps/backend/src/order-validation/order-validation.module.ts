import { Module } from '@nestjs/common';
import { OrderValidationController } from './order-validation.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [OrderValidationController],
})
export class OrderValidationModule {}
