import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createTestApp } from './utils';

describe('App (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('/health → 200 (без префикса)', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
  });
});
