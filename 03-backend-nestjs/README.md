# Delivery API (backend)

Бэкенд маркетплейса доставки: **NestJS 11 + Fastify**, **PostgreSQL + Prisma 7** (driver adapter `pg`), **Redis** (сессии/отзыв токенов), JWT-аутентификация, cron-симулятор статусов заказов.

## Требования

- Node.js ≥ 20 LTS, npm ≥ 10
- Docker Desktop (для PostgreSQL и Redis)

## Быстрый старт

### Режим разработки (инфра в Docker, приложение локально — с hot reload)

```bash
# из корня репозитория — поднять только БД и Redis
docker compose up -d postgres redis

# из 03-backend-nestjs/
cp .env.example .env          # заполнить секреты
npm install
npx prisma migrate deploy     # применить миграции
npx prisma db seed            # наполнить БД (идемпотентно)
npm run start:dev             # http://localhost:3001
```

### Полный режим (всё в контейнерах)

```bash
# из корня репозитория
docker compose up --build     # postgres + redis + backend с миграциями и сидом
```
Backend поднимется на `http://localhost:3001`, миграции и сид выполнит `entrypoint.sh` автоматически (сид — при `SEED_ON_START=true`).

## Переменные окружения

| Переменная | Назначение | Пример |
|---|---|---|
| `NODE_ENV` | окружение | `development` |
| `PORT` | порт приложения | `3001` |
| `DATABASE_URL` | подключение к Postgres | `postgresql://delivery:delivery@localhost:5432/delivery` |
| `REDIS_URL` | подключение к Redis | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | секрет подписи access-JWT | `changeme` |
| `JWT_ACCESS_TTL` | срок жизни access | `30m` |
| `JWT_REFRESH_TTL` | срок жизни refresh | `7d` |
| `CORS_ORIGINS` | разрешённые origin (через запятую) | `http://localhost:3000` |
| `SEED_ON_START` | сидить БД при старте контейнера | `true` |
| `ADMIN_PASSWORD` | пароль сидового админа | `admin12345` |

Приложение падает на старте, если обязательная переменная не задана (валидация env — fail fast).

## База данных (Prisma)

```bash
npx prisma migrate dev --name <change>   # создать + применить миграцию (dev)
npx prisma migrate deploy                # применить миграции (prod/CI)
npx prisma db seed                       # идемпотентный сид
npx prisma studio                        # GUI для БД
npx prisma generate                      # перегенерировать клиент
```

> **Важно (Windows):** если после миграции типы Prisma «отстали» (нет новых моделей/полей) — останови `start:dev`, выполни `npx prisma generate`, перезапусти TS-сервер редактора.
>
> **Важно:** версия CLI `prisma` должна точно совпадать с `@prisma/client` (обе `7.10.0`). Не ставь `prisma` без пина — подтянется RC Prisma 8 с несовместимым CLI.

## Тесты

```bash
npm test              # юнит-тесты (delivery, cron)
npm run test:e2e      # e2e (auth, orders, cron, health)
```
E2e используют отдельную БД `delivery_test` и Redis db-индекс `1` (создаются/мигрируются автоматически). Нужны поднятые `postgres` и `redis`.

## API

- Базовый префикс: **`/api/v1`** (напр. `POST /api/v1/auth/login-or-register`).
- Вне префикса: `/health`, `/ready` (health-пробы), `/static/*` (картинки).
- **Swagger:** `http://localhost:3001/api/docs` (только вне production).

### Аутентификация

Signed access-JWT (короткий) + opaque refresh (ротация, reuse-detection, отзыв через Redis). Транспорт — только `Authorization: Bearer <access>`. Подробности — [`../01-requirements/backend/auth.md`](../01-requirements/backend/auth.md).

## Сидовые аккаунты

| Роль | Email | Пароль |
|---|---|---|
| admin | `admin@delivery.local` | `admin12345` (или `ADMIN_PASSWORD`) |
| client | `ivan@mail.ru` | `password123` |
| client | `maria@mail.ru` | `password123` |

## Структура

```
src/
  core/         # config, prisma, redis, filters, interceptors — инфраструктура
  health/       # liveness/readiness
  modules/      # auth, users, categories, products, cart, delivery, orders, cron, admin
prisma/         # schema.prisma, migrations, seed.ts
static/         # картинки товаров и аватары
test/           # e2e
```

## Полезное

```bash
docker compose logs -f backend     # логи backend
docker compose down                # остановить (данные БД сохранятся)
docker compose down -v             # остановить и удалить volume БД
docker compose exec redis redis-cli   # консоль Redis (KEYS *, TTL ...)
```
