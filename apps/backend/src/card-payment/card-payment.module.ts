import { Module } from '@nestjs/common';
import { CardPaymentController } from './card-payment.controller';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [StripeModule],
  controllers: [CardPaymentController],
})
export class CardPaymentModule {}
