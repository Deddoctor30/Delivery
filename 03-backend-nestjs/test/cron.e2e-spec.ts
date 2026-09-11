import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { OrderStatusSimulator } from '../src/modules/cron/order-status-simulator.service';
import { createTestApp, resetState } from './utils';

describe('Cron (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let simulator: OrderStatusSimulator;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    simulator = app.get(OrderStatusSimulator);
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(async () => {
    await resetState(app);
  });

  async function createOrder(): Promise<string> {
    const category = await prisma.category.create({ data: { slug: 'c', name: 'C' } });
    const product = await prisma.product.create({
      data: {
        slug: 'p',
        name: 'P',
        description: 'x',
        price: 10000,
        imageUrl: '/x.webp',
        stock: 5,
        categoryId: category.id,
      },
    });
    const reg = await request(app.getHttpServer())
      .post('/api/v1/auth/login-or-register')
      .send({ email: 'c@mail.ru', password: 'password123' })
      .expect(200);
    const token = reg.body.accessToken;
    await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set({ Authorization: `Bearer ${token}` })
      .send({ productId: product.id, quantity: 1 })
      .expect(201);
    const order = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set({ Authorization: `Bearer ${token}` })
      .send({ deliveryAddress: 'Москва 1', deliveryLat: 55.76, deliveryLng: 37.61 })
      .expect(201);
    return order.body.id;
  }

  it('created → processing после «прошедшей» минуты', async () => {
    const orderId = await createOrder();

    // сдвигаем время последнего перехода на 2 минуты назад
    await prisma.orderStatusHistory.updateMany({
      where: { orderId },
      data: { changedAt: new Date(Date.now() - 2 * 60_000) },
    });

    await simulator.tick();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe('processing');
  });

  it('created → без изменений, если минута не прошла', async () => {
    const orderId = await createOrder();

    await simulator.tick(); // заказ только что создан

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe('created');
  });
});
