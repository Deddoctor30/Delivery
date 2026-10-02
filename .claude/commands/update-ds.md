---
description: Создать/обновить компонент дизайн-системы в shared/ui из Pencil
argument-hint: "[component, напр. Counter]"
---

Запусти субагента `pen-ds-builder` с задачей: построить/обновить компонент дизайн-системы **"$ARGUMENTS"** в `src/shared/ui`, строго по `04-web-nextjs/docs/pencil-pipeline.md`.

Если `$ARGUMENTS` пуст — сначала выполни разведку (как `/pencil-pull`), покажи, каких примитивов не хватает в `shared/ui`, и спроси, какой делать.

После работы агента: кратко отчитайся (что создано/изменено, результат lint+arch) и напомни про коммит в формате `feat(web): <component> design-system component`.
