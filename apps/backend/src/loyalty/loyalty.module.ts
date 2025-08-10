import { Module } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyRouter } from './loyalty.router';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [LoyaltyService, LoyaltyRouter],
})
export class LoyaltyModule {}
