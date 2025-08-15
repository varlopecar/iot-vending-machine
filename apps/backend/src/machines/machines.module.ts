import { Module } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { MachinesRouter } from './machines.router';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [AlertsModule],
  providers: [MachinesService, MachinesRouter],
})
export class MachinesModule {}
