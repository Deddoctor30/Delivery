# Delivery — правила для AI-агентов

Монорепо из независимых слоёв. Полная карта проекта — в [README.md](README.md).

## Слои и где их правила
- `01-requirements/` — бизнес-требования и ПЛАНЫ. Индекс: [agents/plans.md](agents/plans.md)
- `02-design/` — Pencil (.pen, зашифрованы — только через Pencil MCP)
- `03-backend-nestjs/` — NestJS + Postgres + Prisma
- `04-web-nextjs/` — Next.js, FSD. Правила слоя: [04-web-nextjs/AGENTS.md](04-web-nextjs/AGENTS.md)
- `05-mobile-rn/` — Expo/RN. Правила слоя: [05-mobile-rn/AGENTS.md](05-mobile-rn/AGENTS.md)

## Перед работой в слое
Прочитай `AGENTS.md` этого слоя — там версии, команды, конвенции.

## Мульти-агентный сетап
Как устроена работа двух агентов (Claude Code и Cline) и кто что делает —
см. [agents/README.md](agents/README.md).
