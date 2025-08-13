import { Module, Global } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeRouter } from './stripe.router';

@Global()
@Module({
  providers: [StripeService, StripeRouter],
  exports: [StripeService],
})
export class StripeModule {}
