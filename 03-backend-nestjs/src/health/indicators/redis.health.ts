import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly redis: RedisService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    try {
      // ioredis с maxRetriesPerRequest:null держит команды в offline-очереди,
      // поэтому не ждём ping, если соединение не готово — сразу down
      if (this.redis.status !== 'ready') {
        return indicator.down({ message: `redis not ready: ${this.redis.status}` });
      }

      // соединение готово, но подстрахуемся от зависшего сокета таймаутом
      const pong = await this.withTimeout(this.redis.ping(), 1500);
      if (pong !== 'PONG') {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return indicator.down({ message: `unexpected ping reply: ${pong}` });
      }
      return indicator.up();
    } catch (error) {
      return indicator.down({ message: (error as Error).message });
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms),
      ),
    ]);
  }
}
