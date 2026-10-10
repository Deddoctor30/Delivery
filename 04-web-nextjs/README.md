# 04-web-nextjs — Delivery Web

Next.js (App Router) веб-приложение Delivery. React 19, Tailwind v4 (CSS-first), TypeScript strict, Turbopack. Архитектура кода — **Feature-Sliced Design**.

## Запуск

```bash
npm run dev       # dev-сервер (Turbopack) → http://localhost:3000
npm run build     # прод-сборка (output: standalone)
npm start         # запуск прод-сборки (для Lighthouse / проверки Docker-поведения)
npm run lint      # ESLint (+ boundaries: границы импортов FSD)
npm run arch      # Steiger: архитектурный линтер FSD
npm run typecheck # next typegen + tsc --noEmit
npm run format    # Prettier
npm run gen:api   # перегенерировать src/shared/api/schema.d.ts из OpenAPI бэка
ANALYZE=true npm run build  # отчёт @next/bundle-analyzer
```

> Фронт бесполезен без бэка — сначала подними `03-backend-nestjs` (см. его README), затем веб.

## Окружение (env)

Скопируй `.env.example` → `.env.local`. Секретов нет (только адреса), но различие **build-time vs runtime** критично:

| Переменная                 | Где читается                                | Когда применяется                 | Значение (local / Docker)                                 |
| -------------------------- | ------------------------------------------- | --------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | браузер (`next/image`, ссылки на `/static`) | **инлайнится в бандл на `build`** | `http://localhost:3001` (в обоих — браузер ходит снаружи) |
| `NEXT_PUBLIC_SITE_URL`     | браузер/SSR (canonical, OG, sitemap)        | **инлайнится в бандл на `build`** | `http://localhost:3000`                                   |
| `API_INTERNAL_URL`         | только сервер (RSC, route handlers, мост)   | **runtime**                       | `http://localhost:3001` / `http://backend:3001`           |

Ловушка Next: `NEXT_PUBLIC_*` «запекаются» в JS на этапе сборки, менять их в runtime поздно — поэтому в Docker они передаются как **build-args**, а `API_INTERNAL_URL` — как обычный runtime-`environment`. Все три валидируются через `zod` при старте (`shared/config/{public-env,env,site}.ts`) — битый конфиг падает сразу.

## Запуск в Docker

Из **корня репозитория** (поднимает postgres + redis + backend + web):

```bash
docker compose up --build       # собрать и поднять весь стек
docker compose logs -f web      # логи фронта
```

Веб → `http://localhost:3000`. Образ тонкий за счёт `output: "standalone"` (Next кладёт `server.js` + только трассированные `node_modules` в `.next/standalone`, образ ничего не доустанавливает). `outputFileTracingRoot` в `next.config.ts` фиксирует корень трассировки на папке проекта — иначе Next нашёл бы lockfile выше и вложил standalone в подпапку.

## Архитектура (FSD)

Слои (импорт только **вниз**): `app → views → widgets → features → entities → shared`.

- `src/app` — роутинг Next (App Router) + тонкие роуты, которые монтируют экраны из `views`.
- `src/views` — экраны (переименованный слой FSD `pages`, чтобы не конфликтовать с роутингом Next).
- `src/widgets` — самостоятельные блоки (Header, Footer, CategoryNav…).
- `src/features` — пользовательские сценарии (auth, product-search…).
- `src/entities` — доменные сущности (user, product, order…).
- `src/shared` — переиспользуемое без доменной привязки; `shared/ui` — дизайн-система.

Public API — посегментно (`shared`) и посрезово (`index.ts`). Границы проверяют `eslint-plugin-boundaries` (`npm run lint`) и `steiger` (`npm run arch`). Конфиг Steiger с Next-aware исключениями — `steiger.config.ts`.

## Авторизация: cookie↔header мост

Браузерный JS **никогда не видит токены**. Nest отдаёт пару access/refresh в теле ответа и знает только `Authorization: Bearer` (cookie-agnostic). На отрезке браузер↔Next токены живут в **HttpOnly-куках**, а на хопе Next→Nest их читает сам Next и подставляет `Bearer`.

- Все авторизованные запросы идут **через route handlers Next** (`src/app/api/auth/*` + серверные фетчеры `apiServerAuth`), а не напрямую из браузера в Nest → для веба **CORS не нужен** (всё same-origin).
- Мост: `src/features/auth/api/bridge.ts` (login-or-register / me / refresh / logout), серверные клиенты `src/shared/api/{server,client-auth}.ts` читают `API_INTERNAL_URL`.
- `getCurrentUser()` в корневом layout гидрирует публичные поля юзера; токены в состояние клиента не попадают.
- `/admin/*` защищён серверной проверкой роли в layout сегмента (редирект не-админа) — поверх бэкового `RolesGuard` (оборона в глубину).

Нормативная спека — [`../01-requirements/backend/auth.md`](../01-requirements/backend/auth.md) §6.

## Карты (checkout)

Провайдер — **Leaflet + OpenStreetMap-тайлы** (бесплатно, без API-ключа; достаточно для MVP). Карта монтируется client-only через `dynamic(() => …, { ssr: false })` (`src/shared/ui/map-picker.tsx` → `map-picker-impl.tsx`) — браузерный SDK нельзя рендерить на сервере. Иконки маркера подгружаются с CDN unpkg (Turbopack не отдаёт png-импорты из `leaflet/dist/images`). Выбор точки → координаты → `POST /delivery/estimate` пересчитывает срок и стоимость доставки.

## Дизайн-система

`src/shared/ui` — примитивы DS, сгенерированные из дизайна в Pencil и приведённые к токенам.
Токены — CSS-переменные в `src/app/globals.css` (`:root`/`.dark` + `@theme inline`); используются семантическими утилитами Tailwind (`bg-primary`, `text-foreground`…). Хелпер `cn` — только из `@/shared/lib/utils`.

## Pencil → код: конвейер

Дизайн живёт в [Pencil](https://pencil.dev) (`.pen`-файлы читаются **только** через Pencil MCP). Чтобы не гонять тяжёлую модель на рутине, превращение дизайна в код вынесено в **субагентов** (Sonnet) и запускается **слэш-командами**. Контракт, которому следует каждый агент, — [`docs/pencil-pipeline.md`](docs/pencil-pipeline.md) (источник правды: как мапить токены, пути FSD, жёсткие правила).

### Команды (`.claude/commands`)

| Команда                  | Что делает                                                                                          | Куда пишет                          |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `/pencil-pull`           | Разведка: читает `app_state` Pencil, сверяет с `shared/ui`, показывает, каких примитивов не хватает | — (только отчёт)                    |
| `/update-ds <A, B, …>`   | Строит/обновляет примитивы DS (можно списком через запятую — один прогон, один апдейт `index.ts`)   | `src/shared/ui`                     |
| `/make-component <Name>` | Собирает компонент (entity/feature/widget) композицией из существующего DS                          | `src/{entities,features,widgets}/…` |
| `/make-page <Name>`      | Собирает целый экран + тонкий роут                                                                  | `src/views/*` + `src/app/*`         |

### Субагенты (`.claude/agents`)

| Агент                   | Роль                                                                                           | Запускается       |
| ----------------------- | ---------------------------------------------------------------------------------------------- | ----------------- |
| `pen-ds-builder`        | Примитивы DS, высокая точность к токенам (значения hex — **точно** из Pencil, без приближений) | `/update-ds`      |
| `pen-component-builder` | Компоненты из готового DS, только композиция — без новых стилей                                | `/make-component` |
| `pen-view-builder`      | Экран целиком из фрейма Pencil                                                                 | `/make-page`      |

### Правила конвейера (кратко — полное в контракте)

- `.pen` — только через Pencil MCP; значения токенов берём **точно** из Pencil (`Print(GetVariables())`), не переводим в oklch и не приближаем.
- Переиспользуем существующие токены/утилиты, не плодим дубликаты.
- `cn` только из `@/shared/lib/utils`; иконки только `lucide-react` (в 1.x нет бренд-иконок).
- Не выдумываем несуществующие Tailwind-утилиты (Tailwind молча их игнорирует, lint/arch не ловят) — нужной нет → объявляем в `globals.css` через `@utility`.
- Компонент не готов, пока не прошли `npm run format && npm run lint && npm run arch`.

> **Важно:** для чтения `.pen` десктоп-приложение Pencil должно быть **запущено** — иначе агент не подключится к MCP. Если Pencil недоступен, агент обязан остановиться и сообщить об этом, а не выдумывать значения.

## Тесты

Пока не заведены — вынесены в конец плана (этап 19). Запланировано: **Vitest + React Testing Library** на чистую логику (стор корзины, `Counter`, формат цены, маппинг статусов `StatusTimeline`) и **Playwright** на golden path (поиск → карточка → корзина → логин+мерж → checkout → заказ → отмена).
