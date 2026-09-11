import { OrderStatusSimulator } from './order-status-simulator.service';

describe('OrderStatusSimulator', () => {
  const base = new Date('2026-01-01T00:00:00Z');
  let clock: { now: jest.Mock };
  let prisma: any;
  let sim: OrderStatusSimulator;

  beforeEach(() => {
    clock = { now: jest.fn(() => base) };
    prisma = {
      order: { findMany: jest.fn(), update: jest.fn() },
      orderStatusHistory: { create: jest.fn() },
      // прогоняем колбэк транзакции, подсовывая сам prisma как tx
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),
    };
    sim = new OrderStatusSimulator(prisma, clock);
  });

  it('created → processing, когда прошла 1 минута', async () => {
    prisma.order.findMany.mockResolvedValue([
      {
        id: 'o1',
        status: 'created',
        estimatedDays: 3,
        history: [{ changedAt: new Date(base.getTime() - 61_000) }], // 61 сек назад
      },
    ]);

    await sim.tick();

    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'processing' }) }),
    );
    expect(prisma.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'processing', source: 'cron' }) }),
    );
  });

  it('created → без перехода, если прошло только 30 секунд', async () => {
    prisma.order.findMany.mockResolvedValue([
      {
        id: 'o1',
        status: 'created',
        estimatedDays: 3,
        history: [{ changedAt: new Date(base.getTime() - 30_000) }],
      },
    ]);

    await sim.tick();

    expect(prisma.order.update).not.toHaveBeenCalled();
  });
});
