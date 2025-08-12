import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsRouter } from './payments.router';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PaymentsService, PaymentsRouter],
  exports: [PaymentsService],
})
export class PaymentsModule {}
