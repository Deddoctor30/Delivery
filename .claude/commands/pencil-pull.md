---
description: Разведка дизайна Pencil — список фреймов/компонентов и токенов, сверка с кодом
allowed-tools: mcp__pencil__get_app_state, mcp__pencil__get_guidelines, Read, Grep, Glob
---

Прочитай `04-web-nextjs/docs/pencil-pipeline.md`. Загрузи Pencil-гайд `Design System`. Вызови `get_app_state` (schema + canvas). Выведи отчёт:

1. Reusable-компоненты и top-level фреймы (экраны) из Pencil.
2. Токены (цвета/радиусы/тени/типографика) из Pencil.
3. Сверка: какие DS-компоненты уже есть в `src/shared/ui`, каких не хватает (по карте контракта §4).
4. Расхождения токенов Pencil ↔ `src/app/globals.css`, если есть, + предложенный патч `globals.css` (НЕ применяй без подтверждения).

Только отчёт. Файлы не меняй.
