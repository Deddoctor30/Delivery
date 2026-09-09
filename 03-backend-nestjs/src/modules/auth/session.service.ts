import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { RedisService } from '../../core/redis/redis.service';
import { TokenService } from './token.service';

interface SessionRecord {
  hash: string; // sha256 текущего refresh
  userId: string;
  role: Role;
  issuedAt: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly redis: RedisService,
    private readonly tokens: TokenService,
  ) {}

  private refreshKey = (sid: string) => `refresh:${sid}`;
  private denylistKey = (jti: string) => `denylist:${jti}`;
  private sessionsKey = (userId: string) => `user:${userId}:sessions`;
  private validAfterKey = (userId: string) => `user:${userId}:validAfter`;

  // новый логин → новая сессия
  async createSession(userId: string, role: Role): Promise<TokenPair> {
    return this.issuePair(userId, role, randomUUID());
  }

  // выдача пары + запись в Redis. Используется и при логине, и при ротации.
  private async issuePair(userId: string, role: Role, sessionId: string): Promise<TokenPair> {
    const { token: accessToken } = this.tokens.signAccess(userId, role, sessionId);
    const refreshToken = this.tokens.generateRefresh();
    const ttl = this.tokens.getRefreshTtlSeconds();

    const record: SessionRecord = {
      hash: this.tokens.hashRefresh(refreshToken),
      userId,
      role,
      issuedAt: Math.floor(Date.now() / 1000),
    };

    await this.redis
      .multi()
      .set(this.refreshKey(sessionId), JSON.stringify(record), 'EX', ttl)
      .sadd(this.sessionsKey(userId), sessionId) // индекс сессий юзера — для logout-all
      .expire(this.sessionsKey(userId), ttl)
      .exec();

    return { accessToken, refreshToken, sessionId };
  }

  // ротация: старый refresh меняем на новую пару. Здесь же reuse-detection.
  async rotate(sessionId: string, refreshToken: string): Promise<TokenPair> {
    const raw = await this.redis.get(this.refreshKey(sessionId));
    if (!raw) {
      throw new UnauthorizedException({ code: 'INVALID_REFRESH', message: 'Session not found' });
    }
    const record = JSON.parse(raw) as SessionRecord;

    // предъявленный refresh не совпал с текущим → украден или уже ротирован → убиваем сессию
    if (record.hash !== this.tokens.hashRefresh(refreshToken)) {
      await this.redis.del(this.refreshKey(sessionId));
      await this.redis.srem(this.sessionsKey(record.userId), sessionId);
      throw new UnauthorizedException({ code: 'REFRESH_REUSE', message: 'Refresh token reuse detected' });
    }

    // совпал → перезаписываем ту же сессию новой парой (старый refresh больше не валиден)
    return this.issuePair(record.userId, record.role, sessionId);
  }

  // logout одной сессии: access → denylist, refresh удаляем
  async revokeSession(jti: string, accessExp: number, sessionId: string, userId: string): Promise<void> {
    const ttl = this.tokens.getAccessTtlLeft(accessExp);
    const multi = this.redis.multi();
    if (ttl > 0) multi.set(this.denylistKey(jti), '1', 'EX', ttl);
    multi.del(this.refreshKey(sessionId));
    multi.srem(this.sessionsKey(userId), sessionId);
    await multi.exec();
  }

  // выйти везде: validAfter = now + удалить все refresh юзера
  async revokeAll(userId: string): Promise<void> {
    const sessionIds = await this.redis.smembers(this.sessionsKey(userId));
    const multi = this.redis.multi();
    multi.set(this.validAfterKey(userId), String(Math.floor(Date.now() / 1000)));
    for (const sid of sessionIds) multi.del(this.refreshKey(sid));
    multi.del(this.sessionsKey(userId));
    await multi.exec();
  }

  // проверки для JwtStrategy
  async isDenylisted(jti: string): Promise<boolean> {
    return (await this.redis.exists(this.denylistKey(jti))) === 1;
  }

  async getValidAfter(userId: string): Promise<number | null> {
    const v = await this.redis.get(this.validAfterKey(userId));
    return v ? Number(v) : null;
  }
}
