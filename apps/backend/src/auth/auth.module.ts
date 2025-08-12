import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRouter } from './auth.router';
import { JwtModule } from './jwt.module';

@Module({
  imports: [JwtModule],
  providers: [AuthService, AuthRouter],
  exports: [AuthService],
})
export class AuthModule {}
