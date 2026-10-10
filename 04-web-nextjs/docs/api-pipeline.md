# API → код: конвейер и конвенции

Этот документ читает **каждый субагент** API-конвейера перед работой. Он — источник правды по тому, **как** подключать фронтенд (`04-web-nextjs`) к реальному бэкенду (NestJS, `03-backend-nestjs`) вместо mock-данных. Аналог верстки-конвейера — см. `docs/pencil-pipeline.md`.

## 0. Жёсткие правила

- Бэкенд REST описан OpenAPI. **Типы не пишем руками** — они сгенерированы в `src/shared/api/schema.d.ts` из `http://localhost:3001/api/docs-json` командой `npm run gen:api`. Перегенерировать → `/sync-api`.
- Все сетевые вызовы — **только через типизированные клиенты** `openapi-fetch` (`apiServer` / `apiServerAuth`) и `unwrap()` для разворота ответа. Никаких «голых» `fetch` на бэкенд из компонентов.
- Фетч данных — **на сервере** (RSC, server actions, route handlers). Клиентский код не ходит на бэкенд напрямую и не видит токенов.
- Доменные типы (`entities/*/model/types.ts`) — наш контракт для UI. API-слой **маппит** ответ бэкенда (типы из `schema.d.ts`) в доменный тип. Пропсы компонентов при замене mock **не меняем** — только источник данных.
- Готово, когда прошли: `npm run format`, `npm run lint`, `npm run arch`, `npm run typecheck` (из папки `04-web-nextjs`).
- Бэкенд должен быть **запущен** (`http://localhost:3001`) для `gen:api` и для реальной проверки. Схема уже сгенерирована — если бэкенд недоступен, работай по текущему `schema.d.ts`, не выдумывай пути/поля.

## 1. Клиенты и обработка ответа

Файлы в `src/shared/api/`:

- `server.ts` → `apiServer` — **публичные** эндпоинты (products, categories). Без токена.
- `client-auth.ts` → `apiServerAuth` — **приватные** (cart, orders, users/me, delivery/checkout). Middleware сам прикрепляет `Authorization: Bearer` из HttpOnly-куки `access_token`. Только server-side.
- `error.ts` → `ApiError` + `unwrap(promise)` — разворачивает `{data,error,response}`: вернёт `data` или бросит `ApiError(status, code, message, details)`.

Типовой чтение-вызов:

```ts
import "server-only";
import { apiServer } from "@/shared/api/server";
import { unwrap } from "@/shared/api/error";

const data = await unwrap(
  apiServer.GET("/api/v1/products", { params: { query: { page, category } } }),
);
```

Приватный вызов:

```ts
import { apiServerAuth } from "@/shared/api/client-auth";
const cart = await unwrap(apiServerAuth.GET("/api/v1/cart", { cache: "no-store" }));
```

## 2. Кэширование

- **Публичные чтения** (каталог, карточка, категории, популярное, поиск): кэшируемы. По умолчанию `next: { revalidate: 60 }` (или тег: `next: { tags: ["products"] }`), подбирай разумный TTL. Не ставь `no-store` без причины.
- **Приватные/персональные** (cart, orders, users/me): **всегда** `cache: "no-store"` — не кэшировать между пользователями.
- Мутации инвалидируют кэш через `revalidatePath(...)` / `revalidateTag(...)`.

## 3. Размещение по FSD

| Что                                              | Куда                                                       | Клиент                                           |
| ------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------ |
| Чтения сущности (list/byId/search)               | `entities/<entity>/api/*.ts` (`server-only`)               | `apiServer` (public) / `apiServerAuth` (private) |
| Мутации-сценарии (add to cart, checkout, cancel) | `features/<feature>/api/actions.ts` (`"use server"`)       | `apiServerAuth`                                  |
| Экраны (RSC-лоадеры)                             | `views/*` — вызывают `entities/*/api`                      | —                                                |
| Клиентский мост auth (login/refresh)             | уже есть: `features/auth/api/bridge.ts` + `app/api/auth/*` | —                                                |

Правила слоёв те же (импорт вниз). `entities/*/api` может импортировать `@/shared/api`. Мутации, дёргаемые из client-островов, — это **server actions** (см. §5), импортируются в client-компонент и вызываются как функции.

## 4. Маппинг бэкенд → домен

- Прочитай форму ответа в `schema.d.ts` (`components["schemas"][...]` / `operations[...]`). При сомнениях сверься с DTO бэкенда: `03-backend-nestjs/src/modules/<m>/**`.
- Напиши чистую функцию-маппер `toProduct(dto): Product` в `entities/<e>/api/` (или `model/`), которая приводит ответ к доменному типу. Поля, которых нет в домене, не тащи; недостающие опциональные — оставь `undefined`.
- Если бэкенд реально отдаёт больше доменных полей, чем в `model/types.ts` — расширь доменный тип **опциональными** полями (не ломая существующее), как делали для product/order.
- Пагинация/мета: если бэкенд возвращает `{ items, total, page }` — верни из фетчера и список, и мету (для пагинации каталога).

## 5. Мутации — Server Actions

- Файл `features/<feature>/api/actions.ts` с директивой `"use server"` в начале. Каждая экшен-функция — `async`, принимает сериализуемые аргументы, внутри зовёт `apiServerAuth` + `unwrap`, затем `revalidatePath`/`revalidateTag`.
- Возвращай сериализуемый результат (`{ ok: true }` / `{ ok: false, message }`), а не бросай наружу сырой `ApiError` в клиент — оборачивай в try/catch и возвращай понятный результат; на клиенте показывай `toast` (sonner).
- В client-острове импортируй экшен и вызывай из обработчика/`<form action={...}>`. Токен берётся из куки на сервере — клиент его не видит.
- Приватные экшены: бэкенд сам проверит auth (401 → см. §6).

```ts
// features/cart/api/actions.ts
"use server";
import { revalidatePath } from "next/cache";
import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap } from "@/shared/api/error";
import { ApiError } from "@/shared/api/error";

export async function addToCart(productId: string, quantity: number) {
  try {
    await unwrap(
      apiServerAuth.POST("/api/v1/cart/items", {
        body: { productId, quantity },
        cache: "no-store",
      }),
    );
    revalidatePath("/cart");
    return { ok: true as const };
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : "Не удалось добавить в корзину";
    return { ok: false as const, message: msg };
  }
}
```

## 6. Auth / 401 / приватные экраны

- Приватные роуты (`/orders`, `/profile`, `/checkout`) защищены `src/proxy.ts` (редирект неавторизованных). Токен к приватным вызовам прикрепляет `apiServerAuth`.
- Если приватный вызов вернул **401** на сервере (токен протух): для read в RSC — пробрось к `notFound()`/редиректу на вход или верни пустое состояние; не пытайся рефрешить в RSC (рефреш — браузерный, через refresh-куку и `app/api/auth/refresh`, см. `auth.md §6`). Для server action — верни `{ ok:false, message:"Требуется вход" }`.
- `getCurrentUser()` (auth-мост) — для текущего пользователя в RSC/layout.

## 7. Состояния экрана

- Загрузка: `loading.tsx` рядом с роутом или `<Suspense fallback={<Skeleton/>}>` вокруг асинхронных секций.
- Ошибка: `error.tsx` (client, с `reset`) для сегмента; текст из `ApiError.message`.
- Пусто: `EmptyState` из `@/shared/ui` (как в каталоге/заказах).

## 8. Замена mock

- Удаляй `MOCK_*` и переводи потребителей на `entities/*/api`. **Сигнатуры и пропсы компонентов не меняй** — только источник данных (синхронный mock → `await` из API).
- RSC-страницы становятся `async`, вызывают фетчеры и прокидывают данные вниз пропсами (как сейчас mock).
- Оставляй `// TODO`-заметки только если что-то реально не покрыто бэкендом; иначе mock полностью убирается.

## 9. Рабочий цикл воркера

1. Прочитай этот контракт. Определи цель: `/sync-api` (регенерация), `/make-api <entity>` (api-слой сущности + замена её mock), `/wire-view <view>` (перевод экрана на API).
2. Изучи нужные пути/схемы в `schema.d.ts` (+ при необходимости DTO в `03-backend-nestjs`).
3. Напиши api-слой (`entities/*/api` для чтений, `features/*/api/actions.ts` для мутаций) + маппер в доменный тип. Публичное — `apiServer`+кэш; приватное — `apiServerAuth`+`no-store`.
4. Переведи потребителей (views/islands) на реальные вызовы, добавь loading/error/empty.
5. Прогони `npm run format && npm run lint && npm run arch && npm run typecheck` — почини всё.
6. Короткий отчёт: какие эндпоинты подключены, какие файлы созданы/изменены, что с кэшем/auth, что проверено, чего не хватило в API.
