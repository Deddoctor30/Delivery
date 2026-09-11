import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { createTestApp, resetState } from './utils';

describe('Orders (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let token: string;
  let productId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });
  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetState(app);

    // тестовый каталог (в тестовой БД нет сида)
    const category = await prisma.category.create({ data: { slug: 'cat', name: 'Категория' } });
    const product = await prisma.product.create({
      data: {
        slug: 'p1',
        name: 'Товар 1',
        description: 'описание',
        price: 10000,
        imageUrl: '/static/products/p1.webp',
        stock: 5,
        categoryId: category.id,
      },
    });
    productId = product.id;

    const reg = await request(app.getHttpServer())
      .post('/api/v1/auth/login-or-register')
      .send({ email: 'buyer@mail.ru', password: 'password123' })
      .expect(200);
    token = reg.body.accessToken;
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('корзина → заказ → отмена', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set(auth())
      .send({ productId, quantity: 2 })
      .expect(201);

    const order = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set(auth())
      .send({ deliveryAddress: 'Москва, Тверская 1', deliveryLat: 55.76, deliveryLng: 37.61 })
      .expect(201);

    expect(order.body.status).toBe('created');
    expect(order.body.totalAmount).toBe(20000); // 2 × 10000
    const orderId = order.body.id;

    // корзина опустела
    const cart = await request(app.getHttpServer()).get('/api/v1/cart').set(auth()).expect(200);
    expect(cart.body.items).toHaveLength(0);

    // отмена
    const cancelled = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/cancel`)
      .set(auth())
      .expect(201);
    expect(cancelled.body.status).toBe('cancelled');
    expect(cancelled.body.refunded).toBe(true);
  });

  it('пустая корзина → 400 EMPTY_CART', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set(auth())
      .send({ deliveryAddress: 'Москва, Тверская 1', deliveryLat: 55.76, deliveryLng: 37.61 })
      .expect(400);
    expect(res.body.code).toBe('EMPTY_CART');
  });
});
