import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule,
    ThrottlerModule.forRoot([{ttl: 60000, limit: 5}]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow<string>('JWT_ACCESS_TTL') as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    TokenService,
    SessionService,
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // защищаем ВСЁ по умолчанию
  ],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
