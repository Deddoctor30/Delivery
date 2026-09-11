// выполняется ДО импорта модулей — переопределяем окружение на тестовое
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://delivery:delivery@localhost:5432/delivery_test';
process.env.REDIS_URL = 'redis://localhost:6379/1'; // db-индекс 1 — не трогаем dev
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret';
process.env.JWT_ACCESS_TTL ??= '30m';
process.env.JWT_REFRESH_TTL ??= '7d';
process.env.CORS_ORIGINS ??= 'http://localhost:3000';
process.env.SEED_ON_START ??= 'false';
