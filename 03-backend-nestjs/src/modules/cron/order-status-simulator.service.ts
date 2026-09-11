import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Clock } from './clock';

// следующий автоматический статус (без ветки cancel)
const AUTO_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  created: 'processing',
  processing: 'courier_picked_up',
  courier_picked_up: 'in_delivery',
  in_delivery: 'arrived',
  arrived: 'completed',
};

// фиксированные задержки (минуты)
const FIXED_DWELL_MIN: Partial<Record<OrderStatus, number>> = {
  created: 1,
  processing: 5,
};

// доли оставшегося времени доставки для трёх последних переходов
const INTERP_SHARE: Partial<Record<OrderStatus, number>> = {
  courier_picked_up: 0.6,
  in_delivery: 0.35,
  arrived: 0.05,
};

const HEAD_MINUTES = 6; // created(1) + processing(5)

@Injectable()
export class OrderStatusSimulator {
  private readonly logger = new Logger('OrderStatusSimulator');

  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: Clock,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick(): Promise<void> {
    const active = await this.prisma.order.findMany({
      where: { status: { notIn: ['completed', 'cancelled'] } },
      include: { history: { orderBy: { changedAt: 'desc' }, take: 1 } },
    });

    const now = this.clock.now();

    for (const order of active) {
      const next = AUTO_NEXT[order.status];
      if (!next) continue;

      const dwell = this.dwellMinutes(order.status, order.estimatedDays);
      if (dwell === null) continue;

      const last = order.history[0];
      if (!last) continue;

      const elapsedMin = (now.getTime() - last.changedAt.getTime()) / 60_000;
      if (elapsedMin >= dwell) {
        await this.advance(order.id, next);
        this.logger.log(`Order ${order.id}: ${order.status} → ${next}`);
      }
    }
  }

  // сколько минут заказ «сидит» в текущем статусе до следующего перехода
  private dwellMinutes(status: OrderStatus, estimatedDays: number): number | null {
    if (FIXED_DWELL_MIN[status] !== undefined) {
      return FIXED_DWELL_MIN[status];
    }
    const share = INTERP_SHARE[status];
    if (share !== undefined) {
      const deliveryMin = estimatedDays * 24 * 60 - HEAD_MINUTES;
      return deliveryMin * share;
    }
    return null; // терминальный статус
  }

  private async advance(orderId: string, next: OrderStatus): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: next,
          ...(next === 'completed' ? { completedAt: this.clock.now() } : {}),
        },
      });
      await tx.orderStatusHistory.create({
        data: { orderId, status: next, source: 'cron' },
      });
    });
  }
}
