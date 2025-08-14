import { Module } from '@nestjs/common';
import { RestocksService } from './restocks.service';
import { RestocksRouter } from './restocks.router';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RestocksService, RestocksRouter],
  exports: [RestocksService],
})
export class RestocksModule {}
