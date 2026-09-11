import { Module } from '@nestjs/common';
import { DeliveryModule } from '../delivery/delivery.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [DeliveryModule], // нужен DeliveryService
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService], // admin (этап 14) и cron (этап 13) переиспользуют
})
export class OrdersModule {}
