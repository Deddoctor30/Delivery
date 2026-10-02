# Pencil → код: конвейер и конвенции

Этот документ читает **каждый субагент** конвейера перед работой. Он — источник правды по тому, **как** превращать дизайн из Pencil в код этого проекта (`04-web-nextjs`).

## 0. Жёсткие правила
- `.pen` читаем **только** через Pencil MCP (`get_app_state`, `get_guidelines`, `execute`), **никогда** через Read/Grep.
- Перед генерацией загрузи Pencil-гайды: `get_guidelines({category:"guide",name:"Code"})`, затем `"Design System"` и `"Tailwind"`.
- Никаких «произвольных стилей»: цвет/радиус/тень/отступ — из токенов (CSS-переменные), не хардкодь hex.
- RSC по умолчанию; `"use client"` только при интерактиве (состояние, обработчики, хуки браузера).
- Компонент не готов, пока не прошёл `npm run lint` и `npm run arch` (из папки `04-web-nextjs`).

## 1. FSD
Слои: `app → views → widgets → features → entities → shared`. Импорт только **вниз**. Public API — посегментно (shared) и посрезово (`index.ts`). Полные правила — `01-requirements/frontend/PLAN.md`, блок «Архитектура кода: Feature-Sliced Design».

## 2. Где дизайн-система
DS — в `src/shared/ui`. Каждый компонент: файл + экспорт в `src/shared/ui/index.ts` (посегментный баррель). **Не дублируй** существующее — сперва проверь `src/shared/ui`.

Уже есть: `button`, `dialog`, `input`, `label`, `sonner` (+ хелпер `cn` в `src/shared/lib/utils`).

shadcn-примитивы добавляй через `npx shadcn@latest add <name>` (лягут в `shared/ui` по алиасам из `components.json`), затем экспортни из `index.ts` и приведи к нашим токенам.

## 3. Токены (Tailwind v4)
Токены — CSS-переменные в `src/app/globals.css` (`:root` и `.dark`), замаплены в `@theme inline`:
- Цвета: `--primary` (голубой), `--background` (серый), `--card` (белый), `--muted`, `--border`, `--ring`, `--destructive`, `--success`, `--warning`.
- Радиусы: `--radius` (16px) → `rounded-md/lg/...`.
- Тени: `--shadow-sm/md/lg` (мягкие).

**Правило:** токен из Pencil **маппится на существующую нашу переменную**. Новую переменную заводи, только если аналога нет — и тогда добавь её в `:root`, `.dark` **и** `@theme inline`.

## 4. Карта Pencil → FSD
| Pencil-узел | FSD-путь |
|---|---|
| `Button/*`, `IconButton/*` | `shared/ui/button` |
| `Label/*` (бейдж/тег) | `shared/ui/badge` |
| `Input/*`, `InputGroup` | `shared/ui/input` |
| `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch` | `shared/ui/<name>` |
| `Counter` | `shared/ui/counter` |
| `Skeleton` | `shared/ui/skeleton` |
| `Avatar` (примитив) | `shared/ui/avatar` |
| `Logo` | `shared/ui/logo` |
| `EmptyState`, `Illustration *` | `shared/ui/empty-state`, `shared/ui/illustration` |
| `MapPlaceholder` | `shared/ui/map-placeholder` |
| `Breadcrumbs` | `shared/ui/breadcrumbs` |
| `ProductCard` | `entities/product/ui/product-card` |
| `OrderCard`, `StatusTimeline` | `entities/order/ui/*` |
| `Avatar` (выбор из набора) | `entities/user/ui/*` |
| `Header`, `Footer`, `CategoryNav`, `BottomTabBar` | `widgets/*` |
| `CookieBanner` | `features/cookie-consent` |
| `SearchInput` (autocomplete) | `features/product-search` |
| экраны (Home/Catalog/Product/Cart/...) | `views/*` + тонкий роут в `app/*` |

## 5. Рабочий цикл воркера
1. Загрузи Pencil-гайды (`Code`, `Design System`, при стилях — `Tailwind`).
2. `get_app_state({include_schema:true,include_canvas_design:true,include_scripts_and_shaders:false})` → найди нужный узел по имени.
3. Определи целевой слой по карте (§4).
4. DS-примитив: по возможности `shadcn add`, иначе компонент на наших токенах (`cva` для вариантов, `cn`). Компонент/экран: **композиция** из `shared/ui`/нижних слоёв — без новых стилей.
5. Экспортни из соответствующего `index.ts` (public API).
6. `npm run lint && npm run arch` — почини нарушения границ/типов.
7. Короткий отчёт: что создано, где, из каких DS собрано, что проверено, чего не хватило.
