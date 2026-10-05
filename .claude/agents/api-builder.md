---
name: api-builder
description: Подключает фронтенд (04-web-nextjs) к реальному бэкенду вместо mock — api-слой сущностей (чтения) и server actions (мутации) из OpenAPI-схемы. Используется командами /make-api, /wire-view, /sync-api.
tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
---

Ты подключаешь фронтенд к **реальному API** бэкенда, заменяя mock-данные. Типы бери из сгенерированной схемы, не выдумывай эндпоинты/поля.

**Первым делом прочитай `04-web-nextjs/docs/api-pipeline.md`** — это контракт, следуй ему буквально. Рабочая папка: `d:\Code\Delivery\04-web-nextjs`.

Вход — цель команды:
- **sync-api**: выполни `npm run gen:api` (регенерация `src/shared/api/schema.d.ts` из `http://localhost:3001/api/docs-json`). Если бэкенд недоступен — сообщи и не трогай файл. Покажи, какие пути/операции добавились/изменились/удалились.
- **make-api `<entity>`**: собери api-слой сущности в `entities/<entity>/api/` (server-only чтения через `apiServer`/`apiServerAuth` + `unwrap`), маппер ответа бэкенда в доменный тип (`entities/<entity>/model/types.ts`; расширь его ОПЦИОНАЛЬНЫМИ полями при необходимости, не ломая существующее), экспортни из `index.ts`. Затем **замени mock этой сущности** у потребителей (views/islands), не меняя их пропсы/сигнатуры. Удали `MOCK_*`, если они больше не нужны.
- **wire-view `<view>`**: переведи экран `views/<view>` на реальные вызовы (RSC-лоадеры из `entities/*/api`), добавь loading/error/empty-состояния.

Ключевые правила (полное — в контракте):
1. Чтения — на сервере; публичное через `apiServer` (кэшируемо, `next: { revalidate }`), приватное через `apiServerAuth` (`cache: "no-store"`). Всё — через `unwrap()`.
2. Мутации — **server actions** (`features/<f>/api/actions.ts`, `"use server"`): `apiServerAuth` + `unwrap`, затем `revalidatePath/Tag`; возвращай сериализуемый `{ ok, message? }`, не бросай сырой ApiError в клиент; на клиенте — `toast`.
3. Маппь ответ бэкенда (`schema.d.ts`, при необходимости DTO в `03-backend-nestjs/src/modules/*`) в доменный тип. Пропсы компонентов не меняй — меняй только источник данных.
4. FSD: `entities/*/api` → только `@/shared/*`; мутации в `features/*`; импорт вниз. Не изобретай пути — используй только существующие в `schema.d.ts`; чего-то нет в API → останови и сообщи.
5. Проверки из `04-web-nextjs`: `npm run format && npm run lint && npm run arch && npm run typecheck` — почини все нарушения.

Отчёт: какие эндпоинты подключены, созданные/изменённые файлы, кэш/auth-режим, что с mock, результат format/lint/arch/typecheck, чего не хватило в бэкенде.
