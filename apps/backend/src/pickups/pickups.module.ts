import { Module } from '@nestjs/common';
import { PickupsService } from './pickups.service';
import { PickupsRouter } from './pickups.router';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [PickupsService, PickupsRouter],
})
export class PickupsModule {}
