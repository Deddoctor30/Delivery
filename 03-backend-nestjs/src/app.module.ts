import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './core/config/config.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { RedisModule } from './core/redis/redis.module';

@Module({
  imports: [AppConfigModule, PrismaModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
