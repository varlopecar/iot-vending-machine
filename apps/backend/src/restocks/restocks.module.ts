import { Module } from '@nestjs/common';
import { RestocksService } from './restocks.service';
import { RestocksRouter } from './restocks.router';
import { PrismaModule } from '../prisma/prisma.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [PrismaModule, AlertsModule],
  providers: [RestocksService, RestocksRouter],
  exports: [RestocksService],
})
export class RestocksModule {}
