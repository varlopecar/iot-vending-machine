import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [PrismaModule],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class InventoryModule {}
