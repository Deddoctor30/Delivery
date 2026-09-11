# Бэкенд — требования и архитектура

Документ описывает, **каким должен быть** бэкенд Delivery: стек, структура, модули, практики, БД, контейнеризация. Это спецификация для будущей реализации в [`03-backend-nestjs/`](../../03-backend-nestjs/), а не описание уже написанного кода.

Источники правды:
- Бизнес-логика — [`01-requirements/README.md`](../README.md).
- **Паттерн авторизации (нормативная спека)** — [`auth.md`](./auth.md).
- Архитектура системы — [`diagrams/architecture.md`](../diagrams/architecture.md).
- Модель данных — [`diagrams/er.md`](../diagrams/er.md).
- Жизненный цикл заказа — [`diagrams/order-state-machine.md`](../diagrams/order-state-machine.md).
- Пользовательские сценарии — [`diagrams/user-flows.md`](../diagrams/user-flows.md).

---

## 1. Стек

| Компонент | Технология |
|-----------|------------|
| Фреймворк | **NestJS** (TypeScript, strict mode) |
| ORM | **Prisma** |
| БД | **PostgreSQL 16** + расширение `pg_trgm` (нечёткий поиск) |
| Хранилище сессий | **Redis 7** (denylist access-токенов, хеши refresh, ротация, reuse-detection) |
| Валидация | `class-validator` + `class-transformer` |
| Авторизация | JWT access (signed) + opaque refresh, `@nestjs/passport`, `passport-jwt`, `bcrypt` для паролей, Redis для отзыва и ротации |
| Планировщик | `@nestjs/schedule` (cron-симулятор статусов) |
| Документация API | Swagger через `@nestjs/swagger` |
| Конфигурация | `@nestjs/config` + `.env`, валидация env через `class-validator` |
| Логирование | встроенный `Logger` Nest (на старте), pino при необходимости |
| Тесты | Jest (unit) + Supertest (e2e) |
| Контейнеризация | Docker + docker-compose (multi-stage build) |

---

## 2. Архитектурные принципы

### Модульность
- Один **бизнес-домен = один Nest-модуль** (auth, users, categories, products, cart, orders, delivery, admin).
- Модули общаются **через сервисы**, не через прямой импорт репозиториев.
- Общая инфраструктура (Prisma-клиент, конфиг, логгер) — в `core/` или `infrastructure/`.

### Слои внутри модуля
```
module/
├── dto/               — входные/выходные контракты (class-validator)
├── entities/          — типы доменных сущностей (часто совпадают с Prisma-моделями)
├── module.controller  — HTTP-слой, тонкий
├── module.service     — бизнес-логика
├── module.module      — Nest-модуль
└── module.spec.ts     — unit-тесты сервиса
```

### Тонкие контроллеры, толстые сервисы
- Контроллер: только парсинг запроса, вызов сервиса, формирование ответа.
- Вся бизнес-логика — в сервисах. Контроллеры не лезут в Prisma напрямую.

### Валидация на границе
- Все входные DTO — с декораторами `class-validator`.
- Глобальный `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
- Сериализация ответов — через `ClassSerializerInterceptor` + `@Exclude()`/`@Expose()` для скрытия чувствительных полей (`passwordHash` и т.п.).

### Ошибки
- Стандартные исключения Nest (`NotFoundException`, `ForbiddenException` и т.д.).
- Глобальный `ExceptionFilter`, который приводит ответы к единой форме:
  ```json
  { "statusCode": 404, "code": "PRODUCT_NOT_FOUND", "message": "...", "details": {} }
  ```
- Доменные ошибки маппятся на HTTP в фильтре, **не** в сервисах.

### Авторизация
Паттерн: **JWT access + opaque refresh + Redis (отзыв и ротация) + Bearer для всех клиентов**. Полная нормативная спецификация — [`auth.md`](./auth.md). Ключевое:

- **Access** — короткоживущий signed JWT (SHOULD 30 мин), несёт `jti` и `iat`. Валидация: подпись → `exp` → denylist по `jti` в Redis (→ опц. `validAfter` юзера). Шаги подпись/`exp` локальны, Redis — один дешёвый lookup.
- **Refresh** — opaque-строка (не JWT, 7 дней). В Redis хранится **только хеш**. Ротируется при каждом использовании, при предъявлении старого/чужого refresh — reuse-detection: убиваем всю сессию.
- **Nest принимает авторизацию ТОЛЬКО через `Authorization: Bearer`** — одна схема для веба и мобилки. Nest client-agnostic и cookie-agnostic, про куки не знает.
- **Веб (Next.js)** — stateless cookie↔header мост: токены в HttpOnly-куках на отрезке браузер↔Next, на хопе Next→Nest Next сам ставит `Bearer`. Next ничего не хранит. Поэтому same-site Nest↔веб и CORS для веба не нужны.
- **Мобилка (RN)** — access/refresh в secure storage (`expo-secure-store`), Bearer напрямую в Nest, без моста.
- `JwtAuthGuard` — глобальный, эндпоинты помечаются `@Public()` для исключений.
- `RolesGuard` + декоратор `@Roles('admin')` для админских ручек.
- Пароли — `bcrypt` (cost 10–12). Секреты JWT — длинные random-строки в env. MUST NOT класть секреты в payload JWT.

### Состояние авторизации в Redis (на стороне Nest)
- `denylist:<jti>` → метка; TTL = остаток жизни access. Наличие ключа = токен отозван.
- `refresh:<sessionId>` → хеш текущего refresh + `userId` + метаданные (устройство, выдан когда); TTL = срок refresh. `sessionId` — одна сессия на логин/устройство.
- (опц.) `user:<userId>:validAfter` → метка времени для «выйти на всех устройствах».
- MUST: только **хеш** refresh (дамп Redis не должен давать рабочие токены), TTL на всех ключах.
- Persistence: SHOULD AOF для `refresh:*` (иначе рестарт Redis разлогинит всех и сломает reuse-detection); для `denylist:*` некритично.

### Отзыв и ротация
- **Logout одной сессии:** `jti` текущего access → в denylist + удалить `refresh:<sessionId>`.
- **Выйти везде / смена пароля / бан:** поднять `validAfter` юзера в `now` + удалить все его `refresh:*`.
- **Ротация:** на каждом refresh — новый access + новый refresh, старый хеш перезаписывается.
- **Reuse-detection:** предъявлен refresh ≠ текущему для сессии → компрометация → удалить всю `refresh:<sessionId>`, релогин.

### Логирование и observability
- Каждый запрос — middleware с requestId, методом, путём, длительностью, статусом.
- Доменные события (создание заказа, переход статуса, отмена) — отдельные `Logger`-вызовы с контекстом.
- На старте без APM, но структура логов должна быть JSON-friendly для будущего парсинга.

---

## 3. Структура папок

```
03-backend-nestjs/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                  — idempotent сид (upsert)
├── src/
│   ├── main.ts                  — bootstrap, ValidationPipe, Swagger, CORS
│   ├── app.module.ts
│   ├── core/
│   │   ├── config/              — typed конфиг + валидация env
│   │   ├── prisma/              — PrismaModule, PrismaService
│   │   ├── logger/
│   │   ├── filters/             — глобальный exception-фильтр
│   │   ├── interceptors/        — logging, serialization
│   │   ├── decorators/          — @Public, @Roles, @CurrentUser
│   │   └── guards/              — JwtAuthGuard, RolesGuard
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── delivery/
│   │   ├── admin/
│   │   └── cron/                — симулятор статусов
│   └── health/                  — /health, /ready
├── static/
│   ├── products/                — изображения товаров (вручную)
│   └── avatars/                 — преднастроенные аватары
├── test/                        — e2e
├── db/
│   └── init/                    — SQL-эталон для эфемерной БД (см. §7)
├── Dockerfile
├── .dockerignore
├── .env.example
├── package.json
└── README.md                    — операционный (как запустить)
```

---

## 4. Модули — что в каждом

### auth
Транспорт — только `Authorization: Bearer`. Детали — [`auth.md`](./auth.md).
- `POST /auth/login-or-register` — единая ручка (см. user-flow §2): если email есть и пароль верный → логин, нет → создаём юзера. Создаёт сессию (`refresh:<sessionId>` в Redis), возвращает access (signed JWT с `jti`) + refresh (opaque).
- `POST /auth/refresh` — ротация: проверяет хеш refresh в Redis, при несовпадении → reuse-detection (убить сессию). Выдаёт новую пару, перезаписывает хеш.
- `POST /auth/logout` — `jti` access → denylist, удалить `refresh:<sessionId>`.
- `POST /auth/logout-all` — «выйти везде»: поднять `validAfter` юзера, удалить все его `refresh:*`.
- `GET /auth/me` — текущий пользователь.

### users
- `GET /users/me` — профиль.
- `PATCH /users/me` — изменить firstName, lastName, avatarId, phone.
- `GET /users/me/orders` — история заказов текущего пользователя.

### categories
- `GET /categories` — дерево (топ + подкатегории, через `parentId`).
- `GET /categories/:slug` — конкретная категория с подкатегориями.

### products
- `GET /products` — листинг с фильтрами: `categoryId`, `search`, `popular`, `seasonal`, `discounted`, `page`, `limit`, сортировка.
- `GET /products/:id` — карточка товара.
- `GET /products/search/suggest?q=...` — autocomplete (5–10 совпадений по `pg_trgm`).
- `GET /products/popular` — для дропдауна поиска при фокусе.

### cart
- `GET /cart` — корзина текущего пользователя.
- `POST /cart/items` — добавить (productId, quantity).
- `PATCH /cart/items/:productId` — изменить количество.
- `DELETE /cart/items/:productId` — удалить.
- `POST /cart/merge` — слить гостевую корзину из localStorage после логина.
- `DELETE /cart` — очистить.

### delivery
- `POST /delivery/estimate` — на вход `{ lat, lng }`, на выход `{ estimatedDays, deliveryAmount, distanceKm }`. Расчёт — Haversine от Москвы (55.7558, 37.6173), интерполяция МСК ≤ 2 дня → Владивосток ≤ 14 дней.

### orders
- `POST /orders` — создание заказа из корзины (имитация оплаты, см. user-flow §3). Создаёт `Order`, `OrderItem` (со снимком цены), пишет первую запись в `OrderStatusHistory`, очищает корзину.
- `GET /orders/:id` — детали + история статусов.
- `GET /orders` — список заказов пользователя (то же что `/users/me/orders`, но удобнее семантически).
- `POST /orders/:id/cancel` — отмена. Разрешена только из `created` и `processing`. Ставит `cancelled`, `refunded: true`, пишет в историю с `source: client`.

### admin (guard: `@Roles('admin')`)
- `GET /admin/users` — список всех пользователей с пагинацией и поиском.
- `GET /admin/users/:id/orders` — заказы конкретного пользователя.
- `POST /admin/orders/:id/cancel` — отмена админом (история с `source: admin`).

### cron (внутренний, без HTTP)
- Задача каждую минуту: выбирает заказы в активных статусах, у которых пора менять статус (по таймингам из state-machine), двигает их.
- Логика интерполяции для `courier_picked_up → in_delivery → arrived → completed` — по `estimatedDays`.
- Идемпотентность: при рестарте контейнера не повторяет переходы (смотрит `OrderStatusHistory`).

### health
- `GET /health` — liveness (всегда 200, пока процесс жив).
- `GET /ready` — readiness (проверка коннекта к Postgres).

---

## 5. БД и Prisma

### Схема
Prisma-схема собирается из ER-диаграммы ([`diagrams/er.md`](../diagrams/er.md)). Ключевые модели: `User`, `Category`, `Product`, `CartItem`, `Order`, `OrderItem`, `OrderStatusHistory`. Enum-ы: `Role`, `OrderStatus`, `StatusChangeSource`.

### Соглашения
- **ID** — `cuid()` (короткие, сортируемые, безопасные для URL).
- **Деньги** — `Int` в копейках (никаких float).
- **Даты** — `DateTime` (UTC). Конвертация в локальное время — на клиенте.
- **Soft delete не используем** — это пет-проект, не усложняем.
- **Имена полей** — `camelCase` в коде, маппинг в `snake_case` колонки через `@map(...)` если хочется.

### Индексы
- `User.email` — `unique`.
- `Category.slug` — `unique`.
- `Product.categoryId` — index.
- `Product.name` — GIN-индекс на `gin_trgm_ops` для autocomplete.
- `Order.userId` + `Order.status` — составной index для админки и истории.
- `OrderStatusHistory.orderId` — index.

### Миграции
- `prisma migrate dev` — локально, при разработке схемы.
- `prisma migrate deploy` — в Docker entrypoint при старте контейнера.
- Миграции коммитятся в репо.

### Сид (Prisma seed)
- **Обязательное требование:** наполнение БД делается через **Prisma seed** ([`prisma/seed.ts`](../../03-backend-nestjs/prisma/seed.ts), будет создан позже).
- Сид **идемпотентный**: все вставки через `upsert` по уникальным ключам (`slug` для категорий, синтетический `slug` для товаров).
- Сид заполняет: категории и подкатегории (5–10 на каждую топ-категорию), товары (с путями к картинкам в `/static/products/...`), набор аватаров (`/static/avatars/...`), одного админа и пару тестовых клиентов.
- Запускается через `prisma db seed` (конфиг в `package.json` секция `prisma.seed`).
- На старте контейнера сид запускается **автоматически** (см. §7).

### Поиск
- **ILIKE + pg_trgm** для autocomplete и поиска (см. architecture.md). Расширение `pg_trgm` создаётся миграцией: `CREATE EXTENSION IF NOT EXISTS pg_trgm`.
- Полнотекстовый поиск через `tsvector` — пока не нужен, оставляем на будущее.

---

## 6. API — общие правила

- **Базовый префикс:** `/api/v1`.
- **Формат:** JSON; даты — ISO 8601; деньги — целые числа (копейки).
- **Пагинация:** query `page` (с 1) + `limit` (дефолт 20, max 100). Ответ: `{ items, total, page, limit }`.
- **Сортировка:** query `sort=field:asc|desc`.
- **Ошибки:** единый формат (см. §2 «Ошибки»).
- **CORS:** для веба формально не требуется — браузер ходит только в Next (same-origin), а Next→Nest идёт server-to-server без куки (см. [`auth.md`](./auth.md) §6). Whitelist через env оставляем как defense-in-depth и для прямых обращений в dev/Swagger. Мобилка — не браузер, CORS неприменим.
- **Rate limiting:** `@nestjs/throttler` на чувствительных ручках (`/auth/*`, `/products/search/suggest`).
- **Swagger:** доступен на `/api/docs` (только в `NODE_ENV !== 'production'` или за basic-auth — решим позже).

---

## 7. Контейнеризация

### Цель
Юзер делает `git clone` + `docker compose up` в корне репо — поднимается всё необходимое: Postgres + бэкенд (+ позже веб). БД заполняется эталонными данными автоматически.

### docker-compose (корень репо)
Сервисы:
- **postgres** — `postgres:16-alpine`, expose 5432 во внутреннюю сеть, healthcheck `pg_isready`.
- **redis** — `redis:7-alpine`, expose 6379 во внутреннюю сеть, healthcheck `redis-cli ping`. SHOULD включить AOF-persistence (`--appendonly yes`) — иначе рестарт разлогинит всех и временно сломает reuse-detection (см. [`auth.md`](./auth.md) §4).
- **backend** — собирается из `03-backend-nestjs/Dockerfile`, `depends_on: postgres + redis (condition: service_healthy)`.
- **web** (позже) — собирается из `04-web-nextjs/Dockerfile`, `depends_on: backend`.

Бэкенд ходит в Postgres по имени сервиса (`postgres:5432`) и в Redis (`redis:6379`), веб — в бэкенд (`backend:3001`).

### Dockerfile бэкенда (multi-stage)
1. **deps stage** — ставит npm-зависимости.
2. **build stage** — генерирует Prisma Client, компилирует TS.
3. **runtime stage** — `node:20-alpine`, копирует `dist/`, `node_modules` (prod), `prisma/`, `static/`. Точка входа — entrypoint-скрипт.

### Entrypoint бэка
Скрипт делает по порядку:
1. `prisma migrate deploy` — применяет миграции.
2. `prisma db seed` — наполняет данными (idempotent).
3. `node dist/main.js` — стартует приложение.

Так юзер получает работающее API с данными сразу после `docker compose up`.

### Статика (картинки)
- `static/products/` и `static/avatars/` **копируются внутрь образа** на этапе build. Volume для статики не нужен — она часть артефакта.
- `ServeStaticModule` отдаёт их по `{API}/static/...`.

### Эфемерная БД с эталоном (отложенная задача)
Параллельный режим запуска (решение зафиксировано, реализуем позже):
- **БЕЗ named volume** для pgdata — данные живут внутри контейнера и умирают при `docker compose down`.
- **Эталон** — SQL-дамп в `03-backend-nestjs/db/init/01-seed.sql`, монтируется в `/docker-entrypoint-initdb.d/`. При каждом старте Postgres проигрывает его с нуля.
- Удобно для демо: «запустил → потыкал → закрыл → следующий запуск опять чистый эталон».
- В этом режиме Prisma seed на старте бэка можно отключить флагом `SEED_ON_START=false`, чтобы не дублировать.

Решение — какой режим включён по умолчанию (Prisma seed vs SQL-эталон) — оставляем на этап реализации Docker-обвязки.

### Переменные окружения
`.env.example` в репо, реальный `.env` — в `.gitignore`. Минимальный набор:
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://delivery:delivery@postgres:5432/delivery
REDIS_URL=redis://redis:6379
JWT_ACCESS_SECRET=changeme
JWT_ACCESS_TTL=30m
JWT_REFRESH_TTL=7d
SEED_ON_START=true
CORS_ORIGINS=http://localhost:3000
```
Refresh — opaque-токен, не JWT, поэтому отдельный `JWT_REFRESH_SECRET` не нужен (refresh не подписывается, в Redis лежит его хеш). Access TTL — 30 мин по [`auth.md`](./auth.md) §2.
Все переменные валидируются на старте через `class-validator` — упасть сразу, если что-то не так, лучше, чем падать в рантайме.

### .dockerignore
Минимум: `node_modules`, `dist`, `.git`, `.env`, `coverage`, `*.log`.

---

## 8. Тестирование

### Unit
- Каждый сервис — со своим `.spec.ts`.
- Зависимости (PrismaService и т.п.) — мокаются через `jest-mock-extended` или ручные провайдеры.
- Покрытие — целимся в 70%+ по бизнес-сервисам, в первую очередь `orders`, `delivery`, `cron`.

### E2E
- `test/` с отдельной тестовой БД (поднимается в CI через docker-compose override или testcontainers).
- Сценарии из user-flows: регистрация → добавление в корзину → создание заказа → отмена.
- Cron-симулятор тестируется отдельно: вручную инжектим время или дёргаем метод `tick()`.

### Линтинг / форматирование
- ESLint + Prettier с стандартным Nest-конфигом.
---

## 9. Безопасность

- Пароли — `bcrypt`, никакого хранения в plain.
- JWT access-секрет — длинная random-строка в env. MUST NOT класть секреты в payload JWT (payload только base64, читается любым). Безопасность — подпись + HTTPS + хранение токена вне досягаемости JS.
- Refresh — opaque, в Redis только **хеш**; ротация на каждом использовании + reuse-detection (см. [`auth.md`](./auth.md) §5).
- Отзыв: denylist access по `jti` + удаление refresh-сессии; «выйти везде» через `validAfter`.
- Транспорт авторизации — только `Authorization: Bearer`; токен MUST NOT в query или теле. Веб держит токены в HttpOnly+Secure+`SameSite=Strict` куках (Next-мост), не в `localStorage`/`sessionStorage`.
- CSRF: на route handlers Next — `SameSite=Strict` + (defense-in-depth) проверка `Origin`/`Referer`; мобильный Bearer-путь CSRF не требует.
- `helmet` middleware.
- CORS — whitelist через env (defense-in-depth, см. §6).
- Валидация всех входов (см. §2). Запрет лишних полей в DTO (`forbidNonWhitelisted`).
- SQL — только через Prisma, никаких raw query со строковой конкатенацией. Если нужен raw — только параметризованный `$queryRaw`.
- Throttling на `/auth/*` (брутфорс) и на `/products/search/suggest` (DoS).
- Чувствительные поля (`passwordHash`, `email` других пользователей в админке если не нужен) — скрываются через сериализацию.

---

## 10. Что НЕ делаем в MVP

- Очереди (Bull/BullMQ) — cron достаточно. Redis в проекте есть, но **только** под auth-сессии (denylist/refresh), не под очереди.
- Полнотекстовый поиск через `tsvector` — `pg_trgm` хватит.
- Микросервисы — монолит.
- WebSocket / SSE для статусов заказа — клиент опрашивает GET.
- Файловые загрузки (multipart) — не нужны (см. бизнес-требования).
- Реальные платежи — имитация.

---

## 11. Чек-лист готовности бэка (на будущее)

- [ ] Скелет Nest-проекта с TS strict.
- [ ] Prisma + миграция начальной схемы.
- [ ] PrismaService + healthcheck.
- [ ] Redis-клиент (`RedisModule`/`RedisService`) + readiness-проверка коннекта.
- [ ] Глобальные `ValidationPipe`, `ExceptionFilter`, `LoggerInterceptor`.
- [ ] Auth: bcrypt + единая ручка login-or-register; signed access JWT с `jti`, opaque refresh.
- [ ] Redis-состояние: `denylist:<jti>`, `refresh:<sessionId>` (только хеш), TTL на всех ключах.
- [ ] Ротация refresh + reuse-detection; logout (denylist + удаление сессии) и logout-all (`validAfter`).
- [ ] `JwtAuthGuard` глобальный + `@Public()`; проверка denylist при валидации access.
- [ ] Модули: users, categories, products, cart, delivery, orders, admin.
- [ ] Cron-симулятор + тесты на переходы.
- [ ] Сид через Prisma (idempotent) с категориями, товарами, аватарами, админом.
- [ ] `ServeStaticModule` для `/static/*`.
- [ ] Swagger на `/api/docs`.
- [ ] Dockerfile multi-stage + entrypoint с миграциями и сидом.
- [ ] `docker-compose.yml` в корне репо с postgres + redis + backend.
- [ ] `.env.example`, валидация env на старте.
- [ ] Unit-тесты сервисов + e2e ключевых флоу.
- [ ] README в `03-backend-nestjs/` с командами запуска.
