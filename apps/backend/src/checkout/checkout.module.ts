import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutRouter } from './checkout.router';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [PrismaModule, StripeModule],
  providers: [CheckoutService, CheckoutRouter],
  exports: [CheckoutService],
})
export class CheckoutModule {}
