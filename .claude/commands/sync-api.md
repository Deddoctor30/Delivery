---
description: Перегенерировать типы API из OpenAPI бэкенда (schema.d.ts) и показать изменения
---

Запусти субагента `api-builder` с задачей **sync-api**: выполнить `npm run gen:api` (регенерация `src/shared/api/schema.d.ts` из `http://localhost:3001/api/docs-json`), строго по `04-web-nextjs/docs/api-pipeline.md`.

Если бэкенд недоступен — не трогать файл, сообщить об этом.

После работы: кратко отчитайся, какие пути/операции добавились/изменились/удалились, и прогнал ли `npm run typecheck` (не сломались ли существующие вызовы). Напомни про коммит `chore(web): sync api schema`.
