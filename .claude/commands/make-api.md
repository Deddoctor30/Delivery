---
description: Собрать api-слой сущности (чтения) из OpenAPI и заменить её mock на реальные вызовы
argument-hint: "<entity, напр. products>"
---

Запусти субагента `api-builder` с задачей **make-api** для сущности **"$ARGUMENTS"**, строго по `04-web-nextjs/docs/api-pipeline.md`.

Нужно: собрать `entities/$ARGUMENTS/api/*` (server-only чтения через `apiServer`/`apiServerAuth` + `unwrap`, маппер в доменный тип), экспортировать из public API, затем **заменить mock этой сущности** у всех потребителей (views/islands) БЕЗ изменения их пропсов/сигнатур, удалить `MOCK_*` где больше не нужны.

Публичные чтения — кэшируемо; приватные — `cache: "no-store"`. Не изобретать эндпоинты — только существующие в `schema.d.ts`; чего-то нет → остановиться и сообщить.

После работы: кратко отчитайся (эндпоинты, файлы, кэш/auth, судьба mock, format+lint+arch+typecheck) и напомни про коммит `feat(web): wire $ARGUMENTS to real api`.
