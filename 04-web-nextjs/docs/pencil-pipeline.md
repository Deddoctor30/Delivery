# Pencil → код: конвейер и конвенции

Этот документ читает **каждый субагент** конвейера перед работой. Он — источник правды по тому, **как** превращать дизайн из Pencil в код этого проекта (`04-web-nextjs`).

## 0. Жёсткие правила

- `.pen` читаем **только** через Pencil MCP (`get_app_state`, `get_guidelines`, `execute`), **никогда** через Read/Grep.
- Перед генерацией загрузи Pencil-гайды: `get_guidelines({category:"guide",name:"Code"})`, затем `"Design System"` и `"Tailwind"`.
- Никаких «произвольных стилей»: цвет/радиус/тень/отступ — из токенов (CSS-переменные), не хардкодь hex.
- RSC по умолчанию; `"use client"` только при интерактиве (состояние, обработчики, хуки браузера).
- Компонент не готов, пока не прошёл `npm run lint` и `npm run arch` (из папки `04-web-nextjs`).
- Иконки — только `lucide-react`. ⚠️ В lucide-react 1.x **нет бренд-иконок** (Facebook/Instagram/Twitter/Youtube и т.п.) — не импортируй их (будет `TS2305`). Для соцсетей/брендов: опусти блок или используй отдельный brand-set ТОЛЬКО по явному запросу.

## 1. FSD

Слои: `app → views → widgets → features → entities → shared`. Импорт только **вниз**. Public API — посегментно (shared) и посрезово (`index.ts`). Полные правила — `01-requirements/frontend/PLAN.md`, блок «Архитектура кода: Feature-Sliced Design».

## 2. Где дизайн-система

DS — в `src/shared/ui`. Каждый компонент: файл + экспорт в `src/shared/ui/index.ts` (посегментный баррель). **Не дублируй** существующее — сперва проверь `src/shared/ui`.

Уже есть: `button`, `dialog`, `input`, `label`, `sonner` (+ хелпер `cn` в `src/shared/lib/utils`).

shadcn-примитивы добавляй через `npx shadcn@latest add <name>` (лягут в `shared/ui` по алиасам из `components.json`), затем экспортни из `index.ts` и приведи к нашим токенам.

⚠️ **`cn` импортируй ТОЛЬКО из `@/shared/lib/utils`** (единая точка; `utils.ts` — шим над пакетом `cn`). Стиль shadcn base-nova при `add` иногда переписывает импорт на пакет `"cn"` и правит чужие файлы — после `add` проверь `grep 'from "cn"'` и верни все импорты (кроме самого `utils.ts`) на `@/shared/lib/utils`.

## 3. Токены (Tailwind v4) — маппинг Pencil → утилиты

Токены живут как CSS-переменные в `src/app/globals.css` (`:root`/`.dark`) и доступны **семантическими утилитами Tailwind** через `@theme inline`. Используй семантические утилиты (`bg-primary`, `text-foreground`, …), а не произвольные значения с `var()`.

| Pencil `$--`                                               | Утилита Tailwind                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `$--background` / `$--foreground`                          | `bg-background` / `text-foreground`                                     |
| `$--card` (+`-foreground`)                                 | `bg-card` / `text-card-foreground`                                      |
| `$--popover` (+`-foreground`)                              | `bg-popover` / `text-popover-foreground`                                |
| `$--primary` (+`-foreground`)                              | `bg-primary` / `text-primary-foreground`                                |
| `$--secondary` / `$--muted` / `$--accent` (+`-foreground`) | `bg-secondary                                                           | muted | accent`(+`text-*-foreground`) |
| `$--border` / `$--input` / `$--ring`                       | `border-border` / `border-input` / `ring-ring`                          |
| `$--destructive` (+`-foreground`)                          | `bg-destructive` / `text-destructive-foreground`                        |
| `$--color-success\|warning\|error\|info` (+`-foreground`)  | `bg-success\|warning\|error\|info` (+ `text-*-foreground`)              |
| `$--radius-sm\|md\|lg\|xl`                                 | `rounded-sm`(6) / `rounded-md`(8) / `rounded-lg`(12) / `rounded-xl`(16) |
| `$--radius-pill`                                           | `rounded-full`                                                          |
| `$--font-heading`                                          | `font-heading` (Geist)                                                  |
| `$--font-body`                                             | `font-sans` (Inter, дефолт body)                                        |
| `$--font-caption`                                          | `font-caption` (Funnel Sans)                                            |
| `$--font-mono`                                             | `font-mono` (Geist Mono)                                                |

**Правила:**

- **Значения токенов бери ТОЧНО из Pencil** (`execute` → `Print(GetVariables())`): hex как есть, **не** переводи в oklch и не приближай «на глаз». Проектные токены — без префикса `a:` (префикс `a:` — это shadcn-песочница, игнорируй).
- **Переиспользуй существующие токены, не плоди дубликаты.** Если Pencil-узел ссылается на `$--destructive` (напр., Discount/CartBadge), используй `bg-destructive`, а не новый `--discount`.
- Цвет/радиус/тень/шрифт — только через эти утилиты; не хардкодь hex в классах и не используй произвольные значения с `var()` (arbitrary values).
- Нет подходящего токена → заведи переменную в `:root` + `.dark` + `@theme inline`, потом используй её утилиту.
- Семантика success/warning/error/info — это пара «тон-фон + цветной текст» (`bg-success text-success-foreground`), для Label/Alert/статусов заказа.
- Радиусы по типам: кнопки/инпуты → `rounded-md`; карточки/модалки → `rounded-xl`; бейджи/чипы/аватар → `rounded-full`.

## 4. Карта Pencil → FSD

| Pencil-узел                                         | FSD-путь                                          |
| --------------------------------------------------- | ------------------------------------------------- |
| `Button/*`, `IconButton/*`                          | `shared/ui/button`                                |
| `Label/*` (бейдж/тег)                               | `shared/ui/badge`                                 |
| `Input/*`, `InputGroup`                             | `shared/ui/input`                                 |
| `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch` | `shared/ui/<name>`                                |
| `Counter`                                           | `shared/ui/counter`                               |
| `Skeleton`                                          | `shared/ui/skeleton`                              |
| `Avatar` (примитив)                                 | `shared/ui/avatar`                                |
| `Logo`                                              | `shared/ui/logo`                                  |
| `EmptyState`, `Illustration *`                      | `shared/ui/empty-state`, `shared/ui/illustration` |
| `MapPlaceholder`                                    | `shared/ui/map-placeholder`                       |
| `Breadcrumbs`                                       | `shared/ui/breadcrumbs`                           |
| `ProductCard`                                       | `entities/product/ui/product-card`                |
| `OrderCard`, `StatusTimeline`                       | `entities/order/ui/*`                             |
| `Avatar` (выбор из набора)                          | `entities/user/ui/*`                              |
| `Header`, `Footer`, `CategoryNav`, `BottomTabBar`   | `widgets/*`                                       |
| `CookieBanner`                                      | `features/cookie-consent`                         |
| `SearchInput` (autocomplete)                        | `features/product-search`                         |
| экраны (Home/Catalog/Product/Cart/...)              | `views/*` + тонкий роут в `app/*`                 |

## 5. Рабочий цикл воркера

1. Загрузи Pencil-гайды (`Code`, `Design System`, при стилях — `Tailwind`).
2. `get_app_state({include_schema:true,include_canvas_design:true,include_scripts_and_shaders:false})` → найди нужный узел по имени.
3. Определи целевой слой по карте (§4).
4. DS-примитив: по возможности `shadcn add`, иначе компонент на наших токенах (`cva` для вариантов, `cn`). Компонент/экран: **композиция** из `shared/ui`/нижних слоёв — без новых стилей.
5. Экспортни из соответствующего `index.ts` (public API).
6. `npm run format` (Prettier), затем `npm run lint && npm run arch` — почини нарушения стиля/границ/типов.
7. Короткий отчёт: что создано, где, из каких DS собрано, что проверено, чего не хватило.
