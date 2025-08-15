import { Module } from '@nestjs/common';
import { OrderDeliveryController } from './order-delivery.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [OrderDeliveryController],
})
export class OrderDeliveryModule {}
