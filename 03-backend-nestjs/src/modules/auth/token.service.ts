import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

// payload access-токена. НЕ кладём сюда секреты (payload читается любым).
export interface AccessPayload {
  sub: string; // userId
  role: Role;
  jti: string; // id токена — для denylist
  sid: string; // id сессии — чтобы logout знал, какой refresh убить
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // подписанный access JWT (секрет и expiresIn берутся из JwtModule)
  signAccess(userId: string, role: Role, sessionId: string): { token: string; jti: string } {
    const jti = randomUUID();
    const token = this.jwt.sign({ sub: userId, role, jti, sid: sessionId } satisfies AccessPayload);
    return { token, jti };
  }

  // opaque refresh — высокоэнтропийная случайная строка, НЕ JWT
  generateRefresh(): string {
    return randomBytes(32).toString('hex');
  }

  // в Redis кладём только хеш refresh — дамп Redis не даст рабочих токенов
  hashRefresh(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  getRefreshTtlSeconds(): number {
    return this.parseDuration(this.config.get<string>('JWT_REFRESH_TTL', '7d'));
  }

  // остаток жизни access в секундах — TTL для ключа denylist
  getAccessTtlLeft(exp: number): number {
    const left = exp - Math.floor(Date.now() / 1000);
    return left > 0 ? left : 0;
  }

  // "30m" / "7d" / "3600s" / "1h" → секунды
  private parseDuration(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim());
    if (!match) {
      const n = Number(value);
      if (!Number.isNaN(n)) return n;
      throw new Error(`Invalid duration: ${value}`);
    }
    const mult: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return Number(match[1]) * mult[match[2]];
  }
}
