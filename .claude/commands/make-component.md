---
description: Собрать компонент (entities/features/widgets) из дизайна Pencil
argument-hint: "<frame, напр. ProductCard>"
---

Запусти субагента `pen-component-builder` с задачей: собрать компонент **"$ARGUMENTS"** из существующего DS, строго по `04-web-nextjs/docs/pencil-pipeline.md`.

Если агент сообщит, что в `shared/ui` не хватает примитива — предложи сначала выполнить `/update-ds <primitive>`, затем повторить.

После работы: кратко отчитайся (путь, из каких DS собрано, lint+arch) и напомни про коммит.
