import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createTestApp, resetState } from './utils';

describe('Auth (e2e)', () => {
  let app: NestFastifyApplication;
  const creds = { email: 'e2e@mail.ru', password: 'password123' };

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(async () => {
    await resetState(app);
  });

  it('регистрация → me → повторный логин (тот же юзер)', async () => {
    const reg = await request(app.getHttpServer()).post('/api/v1/auth/login-or-register').send(creds).expect(200);

    expect(reg.body.accessToken).toBeDefined();
    expect(reg.body.refreshToken).toBeDefined();
    expect(reg.body.user.passwordHash).toBeUndefined(); // хеш не утёк

    const me = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${reg.body.accessToken}`)
      .expect(200);
    expect(me.body.email).toBe(creds.email);

    const login = await request(app.getHttpServer()).post('/api/v1/auth/login-or-register').send(creds).expect(200);
    expect(login.body.user.id).toBe(reg.body.user.id); // не создали второго
  });

  it('неверный пароль → 401', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/login-or-register').send(creds).expect(200);
    await request(app.getHttpServer())
      .post('/api/v1/auth/login-or-register')
      .send({ ...creds, password: 'wrongpass1' })
      .expect(401);
  });

  it('me без токена → 401', async () => {
    await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
  });
});
