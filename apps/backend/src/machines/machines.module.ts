import { Module } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { MachinesRouter } from './machines.router';

@Module({
  providers: [MachinesService, MachinesRouter],
})
export class MachinesModule {}
