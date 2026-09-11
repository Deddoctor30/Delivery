import { execSync } from 'node:child_process';
import { Client } from 'pg';

module.exports = async function () {
  const testDb = 'delivery_test';
  const adminUrl = 'postgresql://delivery:delivery@localhost:5432/postgres';
  const testUrl = `postgresql://delivery:delivery@localhost:5432/${testDb}`;

  // 1. создать тестовую БД, если её нет
  const client = new Client({ connectionString: adminUrl });
  await client.connect();
  const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [testDb]);
  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE ${testDb}`);
  }
  await client.end();

  // 2. накатить миграции на тестовую БД
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: testUrl },
  });
};
