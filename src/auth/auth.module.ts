import { AdminModule } from '../admin/admin.module';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AdminModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.APP_AUTH_API_KEY,
      signOptions: {
        expiresIn: 60, // 1 Minute
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
