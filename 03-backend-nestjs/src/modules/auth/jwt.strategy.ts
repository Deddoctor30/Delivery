import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SessionService } from './session.service';
import { AccessPayload } from './token.service';
import { AuthUser } from './types';

type RawPayload = AccessPayload & { iat: number; exp: number };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly sessions: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // только Bearer
      ignoreExpiration: false, // passport сам проверит exp
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  // сюда попадаем ТОЛЬКО после успешной проверки подписи (1) и exp (2)
  async validate(payload: RawPayload): Promise<AuthUser> {
    // 3. denylist по jti — токен отозван через logout?
    if (await this.sessions.isDenylisted(payload.jti)) {
      throw new UnauthorizedException({ code: 'TOKEN_REVOKED', message: 'Token revoked' });
    }

    // 4. validAfter — юзер вышел «везде» после выдачи этого токена?
    const validAfter = await this.sessions.getValidAfter(payload.sub);
    if (validAfter !== null && payload.iat < validAfter) {
      throw new UnauthorizedException({ code: 'TOKEN_REVOKED', message: 'Session invalidated' });
    }

    // всё ок → это станет request.user
    return {
      userId: payload.sub,
      role: payload.role,
      jti: payload.jti,
      sid: payload.sid,
      exp: payload.exp,
    };
  }
}
