# 03-backend-nestjs — план разработки

> **Источники правды:**
> - Бизнес-требования — [`../01-requirements/README.md`](../01-requirements/README.md)
> - Спецификация бэка — [`../01-requirements/backend/README.md`](../01-requirements/backend/README.md)
> - Паттерн авторизации (нормативная спека) — [`../01-requirements/backend/auth.md`](../01-requirements/backend/auth.md)
> - ER-модель — [`../01-requirements/diagrams/er.md`](../01-requirements/diagrams/er.md)
> - State machine заказа — [`../01-requirements/diagrams/order-state-machine.md`](../01-requirements/diagrams/order-state-machine.md)
> - User flows — [`../01-requirements/diagrams/user-flows.md`](../01-requirements/diagrams/user-flows.md)

---

## Ключевое отклонение от спеки: Fastify вместо Express

В спеке стек написан абстрактно («NestJS»), по умолчанию Nest использует Express-адаптер. **Мы сознательно выбираем Fastify-адаптер.**

### Почему Fastify
- **Производительность:** Fastify ~2× быстрее Express по запросам/сек и по latency. Для маркетплейса с витриной поиска это заметно.
- **Встроенная JSON-схема валидация** и сериализация — Fastify сериализует ответы по схеме быстрее, чем Express + `JSON.stringify`.
- **Современный, активно развивающийся** — Express почти заморожен.

### Что меняется на практике
- Используем `@nestjs/platform-fastify` вместо `@nestjs/platform-express`.
- В `main.ts` — `NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())`.
- Multipart-загрузки нам не нужны (в требованиях нет user upload), значит несовместимостей с Multer не будет.
- `ServeStaticModule` использует `@fastify/static` под капотом — настройка чуть другая, разберём на этапе 8.
- `helmet` — берём `@fastify/helmet`, не express-версию.
- Throttler у Nest умеет работать с обоими — без изменений.
- Swagger у Nest — тоже умеет, без изменений.
- В тестах Supertest можно использовать с Fastify через `app.getHttpServer()` — работает, проверено.

### Подводные камни Fastify
- `Request` / `Response` объекты — это `FastifyRequest` / `FastifyReply`, не Express. Если будешь обращаться к `req` напрямую (а в Nest этого почти не делаешь — есть DTO и декораторы), типы другие.
- Сторонние middleware из мира Express не всегда совместимы напрямую — но в нашем стеке таких нет.

## Этап 0 — Подготовка окружения ⏱️ 0.5ч

**Цель:** убедиться, что весь нужный софт стоит и работает.

**Что делаешь:**
1. Проверь версии: Node.js ≥ 20 LTS (`node -v`), npm ≥ 10 (`npm -v`), Docker Desktop запущен (`docker --version`, `docker ps`).
2. Поставь Nest CLI глобально: `npm i -g @nestjs/cli`. Проверь: `nest --version`.
3. Поставь Prisma CLI знакомиться: пока не глобально, будем ставить локально в проекте.
4. В VSCode поставь расширения: ESLint, Prettier, Prisma.

**Что узнаёшь:**
- Зачем Nest CLI (генерация модулей, контроллеров, сервисов одной командой).
- Что Docker нам нужен для PostgreSQL (без локальной установки Postgres).

**Как проверить:** все команды отвечают без ошибок.

---

## Этап 1 — Скелет NestJS с Fastify ⏱️ 1ч

**Цель:** поднять пустой Nest-проект с Fastify-адаптером, который отвечает на `GET /`.

**Что делаешь:**
1. В `03-backend-nestjs/` (мы уже здесь): `nest new . --strict --package-manager npm`. На вопрос о существующем README — слить.
2. Удали стандартные Express-зависимости и поставь Fastify-адаптер:
   ```bash
   npm uninstall @nestjs/platform-express
   npm i @nestjs/platform-fastify
   npm uninstall @types/express
   ```
3. В `src/main.ts` перепиши bootstrap на Fastify:
   ```ts
   import { NestFactory } from '@nestjs/core';
   import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
   import { AppModule } from './app.module';

   async function bootstrap() {
     const app = await NestFactory.create<NestFastifyApplication>(
       AppModule,
       new FastifyAdapter({ logger: true }),
     );
     await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
   }
   void bootstrap();
   ```
4. Создай `.env` в `03-backend-nestjs/` и добавь туда `PORT=3001`. Порт вынесен в переменную окружения — не хардкодим. Добавь `.env` в `.gitignore` (Nest CLI обычно уже делает это). Создай `.env.example` с тем же содержимым — он идёт в репо как шаблон. Порт **3001** выбран потому что Next.js по умолчанию занимает 3000.
5. Запусти: `npm run start:dev`. Открой `http://localhost:3001` — должно ответить «Hello World!» из стандартного `AppController`.
6. Включи `strict: true` в `tsconfig.json` (Nest CLI обычно уже ставит, проверь). Заодно `noUncheckedIndexedAccess: true` — учебно полезно.

**Что узнаёшь:**
- Что такое `HttpAdapter` в Nest и как одна и та же бизнес-логика работает поверх разных HTTP-серверов.
- Структуру Nest-проекта: `main.ts`, `app.module.ts`, контроллеры, сервисы.
- `start:dev` запускает с hot reload через `ts-node` + `nodemon`.

**Как проверить:** `curl http://localhost:3001` возвращает `Hello World!`.

**Коммит:** `feat(backend): nest skeleton with fastify adapter`.

---

## Этап 2 — Конфиг, валидация env, базовая обвязка ⏱️ 1.5ч

**Цель:** научиться правильно конфигурировать приложение и падать на старте, если конфиг битый.

**Что делаешь:**
1. Установи: `npm i @nestjs/config class-validator class-transformer`.
2. Создай `.env.example` с минимальным набором (см. спеку §7) и реальный `.env`. Добавь `.env` в `.gitignore`.
3. Создай `src/core/config/`:
   - `env.validation.ts` — класс с полями (`NODE_ENV`, `PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `CORS_ORIGINS`, `SEED_ON_START`) и декораторами `class-validator` (`@IsString`, `@IsInt`, `@IsEnum`, ...). Отдельного `JWT_REFRESH_SECRET` нет: refresh — opaque-токен, не подписывается, в Redis хранится его хеш (см. спеку §7).
   - `config.module.ts` — обёртка над `ConfigModule.forRoot({ validate, isGlobal: true })`.
4. Подключи `ConfigModule` в `AppModule`. Если в `.env` нет одного из обязательных полей — приложение должно упасть на старте с понятным сообщением.
5. Включи глобальный `ValidationPipe`:
   ```ts
   app.useGlobalPipes(new ValidationPipe({
     whitelist: true,
     forbidNonWhitelisted: true,
     transform: true,
   }));
   ```
6. Поставь `@fastify/helmet`, подключи через `app.register(helmet)`. Включи CORS из конфига.

**Что узнаёшь:**
- DI в Nest: как `ConfigService` инжектится в другие сервисы.
- Зачем валидировать env на старте (fail fast).
- Что такое `Pipe` в Nest и как `ValidationPipe` превращает входящий JSON в типизированный DTO.
- `whitelist + forbidNonWhitelisted` отбрасывает «лишние» поля, защищая от mass assignment.

**Как проверить:** удали из `.env` `JWT_ACCESS_SECRET` — приложение падает на старте с ошибкой валидации.

**Коммит:** `feat(backend): typed config with env validation`.

---

## Этап 3 — PostgreSQL + Redis в Docker + Prisma + первая миграция ⏱️ 2ч

**Цель:** поднять Postgres и Redis локально, подключить Prisma, описать первую модель, применить миграцию.

**Что делаешь:**
1. В **корне репо** (`d:\Code\delivery\`) создай `docker-compose.yml` с двумя инфра-сервисами:
   ```yaml
   services:
     postgres:
       image: postgres:16-alpine
       environment:
         POSTGRES_USER: delivery
         POSTGRES_PASSWORD: delivery
         POSTGRES_DB: delivery
       ports: ["5432:5432"]
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U delivery"]
         interval: 5s
         timeout: 3s
         retries: 5
     redis:
       image: redis:7-alpine
       command: ["redis-server", "--appendonly", "yes"]  # AOF: refresh-сессии переживают рестарт
       ports: ["6379:6379"]
       healthcheck:
         test: ["CMD", "redis-cli", "ping"]
         interval: 5s
         timeout: 3s
         retries: 5
   ```
   Redis нужен начиная с этапа 6 (auth-сессии: denylist + refresh), поднимаем его сразу, чтобы потом не возвращаться. Зачем именно Redis и как устроено состояние — см. [`../01-requirements/backend/auth.md`](../01-requirements/backend/auth.md) §4.
2. `docker compose up -d postgres redis`. Проверь `docker ps` — оба контейнера `healthy`.
3. В `03-backend-nestjs/`:
   ```bash
   npm i -D prisma
   npm i @prisma/client
   npx prisma init
   ```
4. В `.env` пропиши `DATABASE_URL=postgresql://delivery:delivery@localhost:5432/delivery`.
5. В `prisma/schema.prisma` опиши **только модель `User` пока** (по ER-диаграмме). Это намеренно — учимся итерационно, не вываливаем всю схему сразу.
6. Создай миграцию: `npx prisma migrate dev --name init_user`. Изучи, что появилось в `prisma/migrations/`.
7. Создай `src/core/prisma/prisma.service.ts` — наследник `PrismaClient` с `onModuleInit` (вызывает `$connect`) и `enableShutdownHooks`. Экспортируй через `PrismaModule` (`@Global()`).
8. Подключи `PrismaModule` в `AppModule`.

**Что узнаёшь:**
- Docker Compose, healthcheck, почему `depends_on: service_healthy` важен.
- Что делает `prisma migrate dev` (генерит SQL, применяет, перегенерит Prisma Client).
- Чем `schema.prisma` отличается от Prisma Client (DSL vs сгенерированный TS-клиент).
- Зачем `PrismaService` глобальный (через `@Global()` модуль) — чтобы не импортировать в каждый модуль.
- `onModuleInit` / `onModuleDestroy` — жизненный цикл Nest.

**Как проверить:** `npx prisma studio` открывает таблицу `User` пустой.

**Коммит:** `feat(backend): postgres + prisma with user model`.

---

## Этап 4 — Health-check и логирование запросов ⏱️ 1ч

**Цель:** добавить базовую наблюдаемость до того, как начинаем городить бизнес-логику.

**Что делаешь:**
1. **Redis-клиент.** `npm i ioredis`. Создай `src/core/redis/redis.service.ts` (обёртка над `ioredis`, коннект по `REDIS_URL`, `onModuleDestroy` → `quit()`) и `@Global()` `RedisModule`. Подключи в `AppModule`. Этот сервис понадобится auth-этапу для denylist/refresh.
2. `npm i @nestjs/terminus`. Создай `src/health/` с контроллером:
   - `GET /health` — liveness, всегда 200.
   - `GET /ready` — readiness, через `TerminusModule` + `PrismaHealthIndicator` (написать самому, проверяет `prisma.$queryRaw\`SELECT 1\``) **и** `RedisHealthIndicator` (свой, проверяет `redis.ping()`).
3. Создай глобальный логирующий interceptor `src/core/interceptors/logging.interceptor.ts`: пишет `[method] [url] [status] [durationMs]` на каждый запрос. Подключи в `main.ts` через `app.useGlobalInterceptors`.
4. Добавь requestId — middleware или interceptor, который ставит `x-request-id` в reply, если не пришёл, и пишет его в логи.

**Что узнаёшь:**
- Разница между liveness и readiness (liveness — «процесс жив», readiness — «готов принимать трафик»).
- Что такое `Interceptor` в Nest и его место в pipeline (`Guard → Interceptor (before) → Pipe → Handler → Interceptor (after) → Filter`).
- Почему requestId критичен для прод-логов (трассировка запроса между сервисами).

**Как проверить:** `curl -i http://localhost:3001/ready` возвращает 200 с JSON `{ status: 'ok', info: { prisma: { status: 'up' }, redis: { status: 'up' } } }`. Останови Postgres или Redis — `/ready` отдаёт 503.

**Коммит:** `feat(backend): health checks and request logging`.

---

## Этап 5 — Глобальный exception-фильтр ⏱️ 0.5ч

**Цель:** привести все ошибки API к единому формату.

**Что делаешь:**
1. Создай `src/core/filters/all-exceptions.filter.ts` (реализует `ExceptionFilter`).
2. Формат ответа — как в спеке §2:
   ```json
   { "statusCode": 404, "code": "PRODUCT_NOT_FOUND", "message": "...", "details": {} }
   ```
3. Маппинг: HttpException → берём status и message; неизвестная ошибка → 500 + `INTERNAL_ERROR`. Логируем стек на уровне `error`, в ответе клиенту стек не шлём.
4. Подключи через `app.useGlobalFilters(...)` в `main.ts`.

**Что узнаёшь:**
- Как Nest ловит исключения из любого слоя.
- Зачем единый формат ошибок (клиенту удобнее парсить, мониторингу удобнее агрегировать).
- Почему стек-трейсы НЕ должны утекать к клиенту (security).

**Как проверить:** временно кинь в каком-нибудь контроллере `throw new NotFoundException('test')` — ответ в твоём формате.

**Коммит:** `feat(backend): unified error response format`.

---

## Этап 6 — Auth: signed access + opaque refresh + Redis (denylist, ротация, reuse-detection) ⏱️ 5-6ч

**Цель:** реализовать единую ручку `POST /auth/login-or-register` (см. user-flows §2) по паттерну из [`../01-requirements/backend/auth.md`](../01-requirements/backend/auth.md): короткий signed access JWT с `jti`, opaque refresh с ротацией и reuse-detection, отзыв через Redis, транспорт только `Bearer`.

> **Перед этапом** прочитай [`auth.md`](../01-requirements/backend/auth.md) целиком и OWASP Cheat Sheet — Authentication / Session Management. Это самый концептуальный этап.

**Что делаешь:**
1. `npm i @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt`. Типы: `@types/passport-jwt`. `ioredis` уже стоит с этапа 4.
2. Дополни модель `User` в `schema.prisma`: `email`, `passwordHash`, `firstName`, `lastName`, `phone?`, `avatarId?`, `role` (enum `Role { client admin }`), `createdAt`. Сделай миграцию `add_user_auth_fields`. **Сессии и токены в Postgres НЕ храним** — это состояние живёт в Redis.

3. **Модель токенов** (§2 auth.md):
   - **Access** — signed JWT, TTL из `JWT_ACCESS_TTL` (30m). Payload: `sub` (userId), `jti` (uuid токена), `role`, `iat`. MUST NOT класть туда секреты.
   - **Refresh** — opaque: `crypto.randomBytes(32).toString('hex')`, НЕ JWT. Возвращается клиенту в открытом виде один раз; в Redis кладём только его **хеш** (sha256).

4. **`AuthService` + `TokenService`/`SessionService`:**
   - `loginOrRegister(dto)`: найти юзера по email; есть → `bcrypt.compare`, не совпало → `UnauthorizedException`; нет → создать (bcrypt-хеш, `role=client`). Затем **создать сессию** (см. ниже) и вернуть `{ accessToken, refreshToken, user }`.
   - `createSession(userId, role, meta)`: сгенерить `sessionId` (uuid), access (с новым `jti`), refresh (opaque); записать в Redis `refresh:<sessionId>` = `{ hash(refresh), userId, meta, issuedAt }` с TTL = refresh TTL; вернуть пару.
   - `refresh(refreshToken, sessionId)`: достать `refresh:<sessionId>`; нет записи → `UnauthorizedException`. Сравнить хеши: **не совпало → reuse-detection** — удалить всю `refresh:<sessionId>` и `UnauthorizedException` (вся сессия гибнет, нужен релогин). Совпало → ротация: новый access + новый refresh, **перезаписать** хеш в Redis (старый refresh больше не валиден).
   - `logout(jti, accessTtlLeft, sessionId)`: `SET denylist:<jti>` с TTL = остаток жизни access; `DEL refresh:<sessionId>`.
   - `logoutAll(userId)`: `SET user:<userId>:validAfter = now`; удалить все `refresh:*` этого юзера (храни индекс сессий юзера, напр. `SADD user:<userId>:sessions <sessionId>`, либо скан по метаданным).

5. **Валидация access (`JwtStrategy`)** — порядок строго как в §2 auth.md:
   1. подпись секретом (делает passport-jwt);
   2. `exp` (делает passport-jwt);
   3. в `validate(payload)` — проверить `denylist:<jti>` в Redis: ключ есть → `UnauthorizedException`;
   4. (опц.) `payload.iat >= user.validAfter` для «выйти везде».
   Шаги 1–2 локальны, Redis трогаем только в 3–4 (один дешёвый lookup).
6. `JwtAuthGuard` (extends `AuthGuard('jwt')`) — **глобальный** через `APP_GUARD`. Декоратор `@Public()` (`SetMetadata`) + чтение его `Reflector`-ом в guard: по умолчанию всё защищено, явно открываем нужное.
7. `@CurrentUser()` — достаёт юзера из `request.user`.
8. **Контроллер** — транспорт только `Bearer`, никаких куки на стороне Nest (куки — забота Next-моста, не бэка):
   - `POST /auth/login-or-register` (Public) → пара токенов в теле.
   - `POST /auth/refresh` (Public) → новая пара (refresh-токен и `sessionId` принимает в теле).
   - `POST /auth/logout` → отзыв текущей сессии.
   - `POST /auth/logout-all` → «выйти везде».
   - `GET /auth/me`.
9. Throttling: `npm i @nestjs/throttler`, к `/auth/*` (5 req/min на IP) — брутфорс.
10. `ClassSerializerInterceptor` глобально + `@Exclude()` на `passwordHash`, чтобы он не утекал в ответы.

> **Куки — НЕ здесь.** Nest остаётся cookie-agnostic. Перекладывание токенов в HttpOnly-куки делает Next.js-мост на этапе фронта (см. auth.md §6). Мобилка кладёт пару в `expo-secure-store` (§7). Бэк просто отдаёт пару в теле.

**Что узнаёшь:**
- Почему access = signed JWT (проверка локальна), а refresh = opaque + хеш в Redis (отзываемость, нет смысла подписывать).
- Denylist по `jti` — как отозвать ещё живой по `exp` access.
- Ротация refresh + reuse-detection — как детектят кражу токена (RFC 9700).
- `APP_GUARD` vs `useGuards`; `Reflector` и `@Public()`.
- Зачем TTL на всех Redis-ключах (самоочистка) и почему в Redis только хеш refresh.

**Как проверить:** через curl/Postman:
- `POST /auth/login-or-register` с новым email → пара токенов; тот же email верный пароль → логин; неверный → 401.
- `GET /auth/me` без токена → 401; с access → юзер без `passwordHash`.
- `POST /auth/refresh` валидным refresh → новая пара; **повторно тем же (старым) refresh → 401 и сессия убита** (reuse-detection): следующий refresh новым тоже не работает.
- `POST /auth/logout` → старый access сразу даёт 401 на `/auth/me` (лежит в denylist), хотя по `exp` ещё жив.
- В `redis-cli`: `KEYS *` показывает `refresh:*` и (после logout) `denylist:*`; `TTL` на ключах > 0.

**Коммит:** `feat(backend): jwt auth (signed access + opaque refresh) with redis revocation`.

---

## Этап 7 — Полная схема БД + Prisma seed ⏱️ 2ч

**Цель:** довести `schema.prisma` до состояния ER-диаграммы и наполнить БД эталонными данными.

**Что делаешь:**
1. Допиши в `schema.prisma`: `Category`, `Product`, `CartItem`, `Order`, `OrderItem`, `OrderStatusHistory`, enum-ы `OrderStatus`, `StatusChangeSource`.
2. Соглашения: ID — `cuid()`, деньги — `Int` (копейки), даты — `DateTime`.
3. Индексы (см. спеку §5):
   - `User.email` unique.
   - `Category.slug` unique.
   - `Product.categoryId` index.
   - `(Order.userId, Order.status)` составной.
   - `OrderStatusHistory.orderId` index.
4. Для `pg_trgm` — создай миграцию вручную через `npx prisma migrate dev --create-only --name enable_pg_trgm` и в SQL-файле добавь:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   CREATE INDEX product_name_trgm_idx ON "Product" USING gin (name gin_trgm_ops);
   ```
   Затем `npx prisma migrate dev` — применит.
5. Создай `prisma/seed.ts`:
   - категории (3 топа × 5-10 подкатегорий);
   - продукты (`upsert` по `slug`-полю, добавь его в модель Product);
   - аватары как enum или константа (`avatarId` = `avatar-1`..`avatar-8`);
   - админ (`role: admin`, пароль захардкоден из env, в README напиши какой);
   - 2 тестовых клиента.
   Все вставки **только через upsert** — сид должен быть идемпотентным.
6. В `package.json` добавь:
   ```json
   "prisma": { "seed": "ts-node prisma/seed.ts" }
   ```
7. Запусти: `npx prisma db seed`. Открой Prisma Studio — данные на месте. Запусти второй раз — никаких дубликатов.
8. Сейчас же создай папки `static/products/` и `static/avatars/` с заглушками (пустые `.gitkeep` достаточно, реальные картинки положишь руками позже).

**Что узнаёшь:**
- Как Prisma делает миграции (генерит SQL по диффу схемы).
- `--create-only` — когда нужен ручной SQL (расширения, кастомные индексы).
- Идемпотентный сид через `upsert`.
- Связи в Prisma (`@relation`, `onDelete: Cascade`).

**Как проверить:** Prisma Studio показывает 3 категории, ~20 подкатегорий, десятки продуктов, 1 админа, 2 клиента.

**Коммит:** `feat(backend): full prisma schema + idempotent seed`.

---

## Этап 8 — Статика (картинки) через @fastify/static ⏱️ 0.5ч

**Цель:** отдавать картинки товаров и аватары по `GET /static/...`.

**Что делаешь:**
1. `npm i @nestjs/serve-static`.
2. В `AppModule`:
   ```ts
   ServeStaticModule.forRoot({
     rootPath: join(__dirname, '..', 'static'),
     serveRoot: '/static',
   })
   ```
   Под Fastify-адаптером `@nestjs/serve-static` сам использует `@fastify/static` — если возникнут конфликты с `wildcard`, лови их и читай доку модуля.
3. Положи руками 2-3 тестовые картинки в `static/products/`. Проверь `http://localhost:3001/static/products/test.webp`.

**Что узнаёшь:**
- Раздача статики из Node-приложения.
- Почему мы храним только относительные пути в БД — портативность.

**Как проверить:** картинка открывается в браузере по прямому URL.

**Коммит:** `feat(backend): static files serving`.

---

## Этап 9 — Модули users, categories, products ⏱️ 3ч

**Цель:** CRUD-чтение каталога — фундамент витрины.

**Что делаешь:**
1. **users** (`src/modules/users/`):
   - `GET /users/me` — возвращает текущего пользователя.
   - `PATCH /users/me` — апдейт `firstName`, `lastName`, `avatarId`, `phone` (DTO с валидацией: `avatarId` через `@IsIn(['avatar-1', ..., 'avatar-8'])`).
   - `GET /users/me/orders` — пока заглушка, доделаешь на этапе 12.
2. **categories**:
   - `GET /categories` — дерево. В сервисе достаём всё одним запросом (`findMany`) и собираем дерево по `parentId` в памяти.
   - `GET /categories/:slug` — категория + дочерние.
3. **products**:
   - `GET /products` с query: `categoryId`, `search`, `popular` (bool), `seasonal` (bool), `discounted` (bool), `page`, `limit`, `sort`.
   - Пагинация: помощник `paginate(prisma, model, args)` или просто руками `findMany + count` в `$transaction`.
   - `GET /products/:id` — одна карточка.
   - `GET /products/popular` — топ-N по `isPopular: true`.
   - `GET /products/search/suggest?q=...` — autocomplete. Запрос:
     ```ts
     this.prisma.product.findMany({
       where: { name: { contains: q, mode: 'insensitive' } },
       take: 10,
     });
     ```
     Это пока ILIKE; pg_trgm задействуется на следующем шаге через `$queryRaw` с `similarity(name, $1)`.
4. Все query-параметры → DTO с `@Transform` и `class-validator` (`@IsOptional`, `@IsInt`, `@Type(() => Number)`).
5. Throttling на `/products/search/suggest` (например, 30 req/min на IP).

**Что узнаёшь:**
- Как Prisma делает `findMany` с фильтрами, как читать `WHERE`-логи (`log: ['query']`).
- N+1 проблема и как её ловить через `include` / `select`.
- Почему сборка дерева категорий в приложении — нормально на нашем объёме (десятки записей), и когда уже нужен рекурсивный CTE.
- DTO для query: `@Type(() => Number)` — иначе всё придёт строкой.

**Как проверить:** курлами / в Swagger пройди все ручки. Проверь, что `forbidNonWhitelisted` режет лишние query-параметры.

**Коммит:** `feat(backend): users, categories, products modules`.

---

## Этап 10 — Cart ⏱️ 1.5ч

**Цель:** корзина для авторизованного пользователя + слияние гостевой корзины при логине.

**Что делаешь:**
1. Модуль `cart`. Все ручки требуют auth.
2. `GET /cart` — возвращает items с включённым продуктом (`include: { product: true }`), итоговую сумму считаем в сервисе.
3. `POST /cart/items { productId, quantity }` — если уже есть, увеличиваем; иначе создаём. Проверяем `stock`.
4. `PATCH /cart/items/:productId { quantity }` — если quantity = 0, удаляем.
5. `DELETE /cart/items/:productId`, `DELETE /cart`.
6. `POST /cart/merge { items: [{ productId, quantity }] }` — мержим гостевую корзину после логина (увеличиваем существующие, добавляем новые). Делать в `$transaction`.

**Что узнаёшь:**
- Транзакции в Prisma (`prisma.$transaction([...])` vs `prisma.$transaction(async tx => ...)`).
- Концепция «уровень изоляции» — для нашего MVP read committed по умолчанию ок, но знать стоит.
- Почему мерж корзины важен UX-но (юзер не теряет товары при логине).

**Как проверить:** добавил товар → `GET /cart` показал. Тот же товар повторно → quantity увеличился, не дубль.

**Коммит:** `feat(backend): cart module with guest cart merge`.

---

## Этап 11 — Delivery (расчёт срока и стоимости) ⏱️ 1ч

**Цель:** чистая функция расчёта — изолированный модуль, легко тестировать.

**Что делаешь:**
1. Модуль `delivery`, эндпоинт `POST /delivery/estimate { lat, lng }`.
2. Сервис:
   ```ts
   const MOSCOW = { lat: 55.7558, lng: 37.6173 };
   const MAX_KM = 6400; // Москва — Владивосток по прямой ~6400 км
   const haversine = (a, b) => { /* формула */ };
   ```
3. Линейная интерполяция: `estimatedDays = clamp(2 + (distance/MAX_KM) * 12, 2, 14)`.
4. Стоимость: например, `300 + distance * 0.5` копеек × что-то — главное, документируй формулу в коде комментом-WHY.
5. **Юнит-тесты** — это первый идеальный кандидат: чистая функция, нет I/O. Напиши `delivery.service.spec.ts` с 4-5 кейсами (Москва, Питер, Новосибирск, Владивосток, граничные).

**Что узнаёшь:**
- Юнит-тесты в Nest через `Test.createTestingModule`.
- Почему чистые функции (без DI и I/O) проще всего тестировать — и это аргумент в пользу выноса логики из контроллеров.

**Как проверить:** `npm run test delivery` — все зелёные.

**Коммит:** `feat(backend): delivery estimation with tests`.

---

## Этап 12 — Orders: создание, отмена, история ⏱️ 3ч

**Цель:** ключевой бизнес-флоу — оформление заказа.

**Что делаешь:**
1. `POST /orders { deliveryAddress, deliveryLat, deliveryLng }`:
   - Берём корзину пользователя.
   - Если пуста → 400 `EMPTY_CART`.
   - Через `prisma.$transaction(async tx => ...)`:
     - вызываем `DeliveryService.estimate` (внутри уже прозрачен — чистая функция);
     - суммируем `priceSnapshot * quantity`;
     - создаём `Order` со статусом `created`;
     - создаём `OrderItem[]` (с priceSnapshot);
     - пишем первую запись в `OrderStatusHistory` (`status: created`, `source: client`);
     - удаляем `CartItem` пользователя.
   - Возвращаем созданный заказ.
2. `GET /orders/:id` — детали + история. Проверка владельца: если `userId !== currentUser.id && role !== admin` → 403.
3. `GET /orders` — список своих заказов с пагинацией.
4. `POST /orders/:id/cancel`:
   - Если статус не `created` и не `processing` → 409 `ORDER_NOT_CANCELLABLE`.
   - Обновляем статус на `cancelled`, ставим `refunded: true`, `cancelledAt: now`.
   - Пишем в `OrderStatusHistory` (`source: client`).
   - Всё в транзакции.
5. **Стейт-машина — отдельный модуль** `src/modules/orders/state-machine.ts` с матрицей разрешённых переходов. Сервис заказов вызывает `canTransition(from, to)` перед записью. Это даст красивые ошибки и упростит cron.

**Что узнаёшь:**
- Снапшоты цены (`priceSnapshot`) — почему хранить дороже, но правильнее.
- Транзакции для атомарности (создание заказа должно либо целиком пройти, либо целиком откатиться).
- State machine как явный объект — паттерн.
- 409 vs 400 vs 422 — разница (мы используем 409 для конфликта состояния).

**Как проверить:** добавь в корзину → создай заказ → корзина пуста, заказ виден в `/orders`. Попытка отменить «в пути» → 409.

**Коммит:** `feat(backend): orders with state machine and cancellation`.

---

## Этап 13 — Cron-симулятор статусов ⏱️ 2.5ч

**Цель:** автоматическое продвижение заказов по статусам.

**Что делаешь:**
1. `npm i @nestjs/schedule`. Подключи `ScheduleModule.forRoot()` в `AppModule`.
2. Модуль `cron`, сервис `OrderStatusSimulator`:
   - `@Cron(CronExpression.EVERY_MINUTE) async tick()`.
   - Достаём все заказы в активных статусах (не `completed`, не `cancelled`).
   - Для каждого: берём последнюю запись из `OrderStatusHistory` → если прошло достаточно времени → переводим в следующий статус, пишем запись в историю (`source: cron`).
3. Тайминги (из state-machine):
   - `created → processing`: 1 минута.
   - `processing → courier_picked_up`: 5 минут.
   - `courier_picked_up → in_delivery`, `→ arrived`, `→ completed`: интерполяция по `estimatedDays`. Остаток времени `estimatedDays * 24*60 - 6 минут` делим в пропорции (например, 60/35/5).
4. **Идемпотентность:** при рестарте контейнера cron не должен повторно делать переходы. Поскольку мы смотрим на текущий статус и время последнего перехода — это уже идемпотентно. Главное — никаких `setTimeout`, только проверка состояния каждый tick.
5. **Тестирование:** инжекти `Date` через провайдер `Clock` (своя обёртка `now()`), чтобы в тесте мочь подменять время. Напиши `cron.service.spec.ts` с парой сценариев: «прошла 1 минута → перешло в processing», «прошло 30 секунд → не перешло».

**Что узнаёшь:**
- `@nestjs/schedule` — cron, интервалы, таймауты.
- Почему «продвигай состояние из состояния», а не «планируй таймер» — переживает рестарт.
- Внедрение зависимости от времени для тестируемости (паттерн `Clock`).

**Как проверить:** создай заказ → через минуту он `processing`, ещё через 5 минут — `courier_picked_up`. Останови приложение на 3 минуты, запусти — догонит.

**Коммит:** `feat(backend): cron status simulator with tests`.

---

## Этап 14 — Admin-модуль ⏱️ 1.5ч

**Цель:** ручки для админки.

**Что делаешь:**
1. Декоратор `@Roles(...roles: Role[])` через `SetMetadata`.
2. `RolesGuard` — читает метадату `Reflector`-ом, сравнивает с `request.user.role`.
3. Подключи `RolesGuard` глобально через `APP_GUARD` (после `JwtAuthGuard`).
4. Модуль `admin`, все ручки `@Roles('admin')`:
   - `GET /admin/users` — пагинированный список, query `search` по email/имени.
   - `GET /admin/users/:id/orders`.
   - `POST /admin/orders/:id/cancel` — то же, что у клиента, но без проверки владельца, и `source: admin` в истории.
5. Логиниться админом через сидового админа.

**Что узнаёшь:**
- RBAC в Nest — простой паттерн «декоратор + guard».
- Порядок выполнения guard-ов (Nest проверяет в порядке регистрации).

**Как проверить:** запрос под клиентским токеном к `/admin/users` → 403. Под админским → 200.

**Коммит:** `feat(backend): admin module with rbac`.

---

## Этап 15 — Swagger ⏱️ 0.5ч

**Цель:** автогенерируемая документация API.

**Что делаешь:**
1. `npm i @nestjs/swagger`.
2. В `main.ts`:
   ```ts
   const config = new DocumentBuilder()
     .setTitle('Delivery API')
     .setVersion('1.0')
     .addBearerAuth()
     .build();
   const document = SwaggerModule.createDocument(app, config);
   SwaggerModule.setup('api/docs', app, document);
   ```
3. По всем DTO расставь `@ApiProperty()` (хотя бы для основных полей).
4. Контроллеры — `@ApiTags('orders')`, `@ApiBearerAuth()` где нужно.
5. Закрой Swagger в `NODE_ENV === 'production'` (или basic-auth — решишь позже).

**Что узнаёшь:**
- OpenAPI как контракт между бэком и фронтом.
- Можно сгенерировать TS-клиента из Swagger — пригодится для веба/мобилки.

**Как проверить:** `http://localhost:3001/api/docs` — все ручки, можно потыкать.

**Коммит:** `feat(backend): openapi documentation`.

---

## Этап 16 — Global prefix /api/v1 ⏱️ 0.2ч

**Цель:** версионирование API.

**Что делаешь:**
- `app.setGlobalPrefix('api/v1')` в `main.ts`. Исключи `/health`, `/ready`, `/static` (через `exclude`).
- Поправь Swagger setup-путь (`api/docs` остаётся без префикса, либо переедет в `api/v1/docs` — на твой вкус).

**Коммит:** `feat(backend): /api/v1 prefix`.

---

## Этап 17 — E2E-тесты ключевых сценариев ⏱️ 2-3ч

**Цель:** покрыть golden path интеграционными тестами.

**Что делаешь:**
1. Отдельная тестовая БД: либо через `docker-compose.test.yml`, либо через `testcontainers-node` (учебно интереснее).
2. `test/auth.e2e-spec.ts` — регистрация → логин → me.
3. `test/order.e2e-spec.ts` — регистрация → добавление в корзину → создание заказа → отмена.
4. `test/cron.e2e-spec.ts` — создание заказа → ручной вызов `simulator.tick()` после «прошедшего времени» → проверка статуса.
5. Перед каждым тестом `prisma.$executeRawUnsafe('TRUNCATE TABLE ... CASCADE')` или пересоздание БД.

**Что узнаёшь:**
- Supertest + Nest — `request(app.getHttpServer()).post(...)`.
- Изоляция тестов на уровне БД.
- Зачем testcontainers (никаких глобальных тестовых БД, всё локально и одноразово).

**Как проверить:** `npm run test:e2e` — зелёный прогон.

**Коммит:** `test(backend): e2e for auth, orders, cron`.

---

## Этап 18 — Dockerfile + docker-compose интеграция ⏱️ 2ч

**Цель:** один `docker compose up` поднимает Postgres + бэкенд с миграциями и сидом.

**Что делаешь:**
1. `03-backend-nestjs/Dockerfile` — multi-stage:
   - **deps stage:** `node:20-alpine`, копируем `package*.json`, `npm ci`.
   - **build stage:** копируем исходники, `npx prisma generate`, `npm run build`.
   - **runtime stage:** `node:20-alpine`, копируем `dist/`, `node_modules` (prod, через `npm ci --omit=dev`), `prisma/`, `static/`. `CMD ["./entrypoint.sh"]`.
2. `entrypoint.sh`:
   ```sh
   #!/bin/sh
   set -e
   npx prisma migrate deploy
   if [ "$SEED_ON_START" = "true" ]; then
     npx prisma db seed
   fi
   exec node dist/main.js
   ```
3. `.dockerignore`: `node_modules`, `dist`, `.git`, `.env`, `coverage`, `*.log`.
4. В корневом `docker-compose.yml` добавь сервис `backend`:
   ```yaml
   backend:
     build: ./03-backend-nestjs
     env_file: ./03-backend-nestjs/.env
     ports: ["3001:3001"]
     depends_on:
       postgres:
         condition: service_healthy
       redis:
         condition: service_healthy
   ```
   Внутри Docker `DATABASE_URL=postgresql://delivery:delivery@postgres:5432/delivery` и `REDIS_URL=redis://redis:6379`.
5. `docker compose up --build` — поднимается всё, картинки на месте, API работает.

**Что узнаёшь:**
- Multi-stage build — почему финальный образ должен быть тонким (без devDependencies, без исходников).
- Layer caching: `package.json` копируется до исходников — `npm ci` не пере-выполняется при изменении кода.
- `depends_on: service_healthy` — порядок старта.
- Entry point vs CMD.

**Как проверить:** `docker compose down -v && docker compose up --build` → через минуту работающий API на `localhost:3001`, БД заполнена сидом.

**Коммит:** `feat(backend): dockerfile and compose integration`.

---

## Этап 19 — Полировка: README операционный, .env.example, финальный чек-лист ⏱️ 0.5ч

**Что делаешь:**
1. **Перепиши этот README** в операционный: «как запустить, как тестить, как сидить, как добавить миграцию». План разработки можно либо удалить, либо вынести в `docs/PLAN.md` — реши сам. На момент окончания этого этапа README должен быть полезен новому разработчику, который зашёл в проект.
2. `.env.example` — все переменные из `.env`, секреты помечены `changeme`.
3. Пройди по чек-листу из `01-requirements/backend/README.md` §11 — все ли пункты закрыты.
4. Финальный коммит: `docs(backend): operational readme`.

---

## Что отложено и почему

Эти вещи в требованиях есть, но мы откладываем — каждое решение зафиксировано:

- **SQL-эталон для эфемерной БД** (см. спеку §7) — параллельный режим запуска. Сейчас живём с named volume + `prisma db seed`. Реализуем, когда захотим демо-режим «закрыл — открыл с нуля».
- **Pino-логгер** — на старте хватает Fastify-логгера и Nest `Logger`. Перейдём на Pino, когда понадобится JSON-логирование под прод.
- **`tsvector` полнотекстовый поиск** — `pg_trgm` достаточно для autocomplete на 200-300 товарах.

> **Не отложено, а решено иначе:** refresh в HttpOnly-куки — это **не** задача бэка. Nest cookie-agnostic и всегда отдаёт пару токенов в теле через `Bearer`; куки ставит Next.js-мост на стороне веба, мобилка хранит пару в secure storage. Паттерн зафиксирован — см. [`../01-requirements/backend/auth.md`](../01-requirements/backend/auth.md) §6–7.

---

## Шпаргалка по командам

```bash
# Разработка
npm run start:dev               # горячая перезагрузка
npm run lint                    # ESLint
npm test                        # unit
npm run test:e2e                # e2e

# Prisma
npx prisma migrate dev --name my_change   # создать миграцию
npx prisma migrate deploy                 # применить (для CI/prod)
npx prisma db seed                        # запустить сид
npx prisma studio                         # GUI для БД

# Docker
docker compose up -d postgres redis       # только инфра (для локальной разработки)
docker compose up --build                 # всё, с пересборкой
docker compose logs -f backend            # логи бэка
docker compose down -v                    # снести и удалить volumes

# Redis (отладка auth-сессий)
docker compose exec redis redis-cli       # консоль Redis
#   KEYS *            — все ключи (refresh:*, denylist:*, ...)
#   TTL refresh:<id>  — остаток жизни сессии
```

---

## Учебные ресурсы по ходу

- **NestJS docs** — `https://docs.nestjs.com` (особенно разделы Fundamentals, Techniques, Security).
- **Prisma docs** — `https://www.prisma.io/docs` (Schema reference, Client API, Migrations).
- **Fastify docs** — `https://fastify.dev/docs/latest/` (когда полезешь под капот адаптера).
- **JWT.io** — потыкать, что внутри токенов.
- **OWASP Cheat Sheets — Authentication, Session Management, CSRF, JWT** — обязательное чтение перед этапом 6.
- **RFC 9700** — OAuth 2.0 Security BCP (короткий access, ротация refresh, reuse-detection).
- **[`../01-requirements/backend/auth.md`](../01-requirements/backend/auth.md)** — нормативный паттерн авторизации проекта (источник правды для этапа 6).
- **Redis docs** — `https://redis.io/docs/latest/` (строки, TTL, AOF-persistence).
