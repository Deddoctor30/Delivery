# Workflow: wire API

Подключить сущность к реальному API вместо mock.

Контракт (web): [../../04-web-nextjs/docs/api-pipeline.md](../../04-web-nextjs/docs/api-pipeline.md).
Типы — только из сгенерированного `schema.d.ts`; эндпоинта нет → остановиться и сообщить.

1. Собрать `entities/<entity>/api/*`: server-only чтения + маппер в доменный тип.
2. Публичные чтения — кэшируемо; приватные — `cache: "no-store"`.
3. Заменить mock у потребителей БЕЗ изменения их пропсов/сигнатур; удалить `MOCK_*`.
4. format + lint + arch + typecheck. Напомнить про коммит.
