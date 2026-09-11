import { Module } from '@nestjs/common';
import { Clock, SystemClock } from './clock';
import { OrderStatusSimulator } from './order-status-simulator.service';

@Module({
  providers: [
    OrderStatusSimulator,
    { provide: Clock, useClass: SystemClock }, // в тестах подменим на фейковые часы
  ],
})
export class CronModule {}
