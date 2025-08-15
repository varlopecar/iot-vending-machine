import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AlertsService } from './alerts.service';
import { AlertsRouter } from './alerts.router';

@Module({
  imports: [PrismaModule],
  providers: [AlertsService, AlertsRouter],
  exports: [AlertsService],
})
export class AlertsModule {}
