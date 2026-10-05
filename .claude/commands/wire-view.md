---
description: Перевести экран (views/*) с mock на реальные вызовы API (RSC-лоадеры + loading/error/empty)
argument-hint: "<view, напр. catalog>"
---

Запусти субагента `api-builder` с задачей **wire-view** для экрана **"$ARGUMENTS"** (`src/views/$ARGUMENTS`), строго по `04-web-nextjs/docs/api-pipeline.md`.

Нужно: перевести экран на реальные данные через `entities/*/api` (RSC-лоадеры; `async`-страница, данные вниз пропсами), добавить состояния loading (`loading.tsx`/`Suspense`+`Skeleton`), error (`error.tsx`), empty (`EmptyState`). Мутации на экране — через server actions (`features/*/api/actions.ts`). Пропсы компонентов не менять.

Если для экрана не хватает api-слоя сущности — предложи сначала `/make-api <entity>`, затем повторить.

После работы: кратко отчитайся (какие лоадеры/экшены, состояния, файлы, format+lint+arch+typecheck) и напомни про коммит `feat(web): wire $ARGUMENTS view to real api`.
