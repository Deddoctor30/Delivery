import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(configService: ConfigService) {
    super(configService.get<string>('REDIS_URL')!, {
      maxRetriesPerRequest: null, // не роняем процесс, ioredis сам переподключается
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });

    this.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
    this.on('connect', () => this.logger.log('Redis connected'));
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
