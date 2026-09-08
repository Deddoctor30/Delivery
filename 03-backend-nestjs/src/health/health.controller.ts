import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './indicators/prisma.health';
import { RedisHealthIndicator } from './indicators/redis.health';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
  ) {}

  // liveness — «процесс жив», без проверки зависимостей, всегда 200
  @Get('health')
  liveness() {
    return { status: 'ok' };
  }

  // readiness — «готов принимать трафик»: проверяем БД и Redis
  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.prismaIndicator.isHealthy('prisma'),
      () => this.redisIndicator.isHealthy('redis'),
    ]);
  }
}
