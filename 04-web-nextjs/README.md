# 04-web-nextjs — Delivery Web

Next.js (App Router) веб-приложение Delivery. React 19, Tailwind v4 (CSS-first), TypeScript strict, Turbopack. Архитектура кода — **Feature-Sliced Design**.

## Запуск

```bash
npm run dev      # dev-сервер (Turbopack) → http://localhost:3000
npm run build    # прод-сборка
npm run lint     # ESLint (+ boundaries: границы импортов FSD)
npm run arch     # Steiger: архитектурный линтер FSD
npm run format   # Prettier
```

## Архитектура (FSD)

Слои (импорт только **вниз**): `app → views → widgets → features → entities → shared`.

- `src/app` — роутинг Next (App Router) + тонкие роуты, которые монтируют экраны из `views`.
- `src/views` — экраны (переименованный слой FSD `pages`, чтобы не конфликтовать с роутингом Next).
- `src/widgets` — самостоятельные блоки (Header, Footer, CategoryNav…).
- `src/features` — пользовательские сценарии (auth, product-search…).
- `src/entities` — доменные сущности (user, product, order…).
- `src/shared` — переиспользуемое без доменной привязки; `shared/ui` — дизайн-система.

Public API — посегментно (`shared`) и посрезово (`index.ts`). Границы проверяют `eslint-plugin-boundaries` (`npm run lint`) и `steiger` (`npm run arch`). Конфиг Steiger с Next-aware исключениями — `steiger.config.ts`.

## Дизайн-система

`src/shared/ui` — примитивы DS, сгенерированные из дизайна в Pencil и приведённые к токенам.
Токены — CSS-переменные в `src/app/globals.css` (`:root`/`.dark` + `@theme inline`); используются семантическими утилитами Tailwind (`bg-primary`, `text-foreground`…). Хелпер `cn` — только из `@/shared/lib/utils`.

## Pencil → код: конвейер

Дизайн живёт в [Pencil](https://pencil.dev) (`.pen`-файлы читаются **только** через Pencil MCP). Чтобы не гонять тяжёлую модель на рутине, превращение дизайна в код вынесено в **субагентов** (Sonnet) и запускается **слэш-командами**. Контракт, которому следует каждый агент, — [`docs/pencil-pipeline.md`](docs/pencil-pipeline.md) (источник правды: как мапить токены, пути FSD, жёсткие правила).

### Команды (`.claude/commands`)

| Команда                  | Что делает                                                                                          | Куда пишет                          |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `/pencil-pull`           | Разведка: читает `app_state` Pencil, сверяет с `shared/ui`, показывает, каких примитивов не хватает | — (только отчёт)                    |
| `/update-ds <A, B, …>`   | Строит/обновляет примитивы DS (можно списком через запятую — один прогон, один апдейт `index.ts`)   | `src/shared/ui`                     |
| `/make-component <Name>` | Собирает компонент (entity/feature/widget) композицией из существующего DS                          | `src/{entities,features,widgets}/…` |
| `/make-page <Name>`      | Собирает целый экран + тонкий роут                                                                  | `src/views/*` + `src/app/*`         |

### Субагенты (`.claude/agents`)

| Агент                   | Роль                                                                                           | Запускается       |
| ----------------------- | ---------------------------------------------------------------------------------------------- | ----------------- |
| `pen-ds-builder`        | Примитивы DS, высокая точность к токенам (значения hex — **точно** из Pencil, без приближений) | `/update-ds`      |
| `pen-component-builder` | Компоненты из готового DS, только композиция — без новых стилей                                | `/make-component` |
| `pen-view-builder`      | Экран целиком из фрейма Pencil                                                                 | `/make-page`      |

### Правила конвейера (кратко — полное в контракте)

- `.pen` — только через Pencil MCP; значения токенов берём **точно** из Pencil (`Print(GetVariables())`), не переводим в oklch и не приближаем.
- Переиспользуем существующие токены/утилиты, не плодим дубликаты.
- `cn` только из `@/shared/lib/utils`; иконки только `lucide-react` (в 1.x нет бренд-иконок).
- Не выдумываем несуществующие Tailwind-утилиты (Tailwind молча их игнорирует, lint/arch не ловят) — нужной нет → объявляем в `globals.css` через `@utility`.
- Компонент не готов, пока не прошли `npm run format && npm run lint && npm run arch`.

> **Важно:** для чтения `.pen` десктоп-приложение Pencil должно быть **запущено** — иначе агент не подключится к MCP. Если Pencil недоступен, агент обязан остановиться и сообщить об этом, а не выдумывать значения.
