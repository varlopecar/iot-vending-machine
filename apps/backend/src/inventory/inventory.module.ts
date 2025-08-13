import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReservationsService } from './reservations.service';
import { InventoryService } from './inventory.service';

@Module({
  imports: [PrismaModule],
  providers: [ReservationsService, InventoryService],
  exports: [ReservationsService, InventoryService],
})
export class InventoryModule {}
