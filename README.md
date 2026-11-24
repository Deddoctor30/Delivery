# Delivery — Full-Stack Production-Style Project

Full-Stack проект приложения доставки: отдельные слои (бизнес-требования, дизайн, бэкенд, веб, мобилка) живут в собственных папках и развиваются как независимые модули.

## Стек

| Слой                 | Технология          |
| -------------------- | ------------------- |
| Дизайн / прототипы   | Pencil (pencil.dev) |
| Бэкенд               | NestJS + PostgreSQL |
| Веб-фронт            | Next.js             |
| Мобильное приложение | React Native        |

## Структура репозитория

```
delivery/
├── 01-requirements/      # Бизнес-требования, юзер-стори, спеки
├── 02-design/            # Pencil-файлы / экспорты дизайна
├── 03-backend-nestjs/    # NestJS API + Postgres
├── 04-web-nextjs/        # Next.js веб-приложение
├── 05-mobile-rn/         # React Native мобильное приложение
└── README.md             # этот файл
```

### 01-requirements

Моки бизнес-требований: проблема, целевые пользователи, юзер-стори, пользовательские сценарии, нефункциональные требования, метрики успеха.

### 02-design

Дизайн будет делаться в [Pencil](https://pencil.dev) — это веб-инструмент дизайна (как Figma, но с AI). Сами проекты хранятся в облаке Pencil, в локальной папке имеет смысл держать:

- ссылку (`PENCIL_LINK.md`) на проект в облаке Pencil;
- экспорты экранов в PNG/SVG (`exports/`);
- спецификации компонентов / design tokens, если будем выгружать.

### 03-backend-nestjs

NestJS-приложение:

- PostgreSQL как основная БД;
- Prisma;
- модульная структура по бизнес-доменам;
- REST;
- авторизация, валидация, миграции, тесты.

### 04-web-nextjs

Next.js приложение (App Router): SSR/SSG, общий API-клиент с бэком, дизайн-система из 02-design. Архитектура — Feature-Sliced Design. Превращение дизайна Pencil в код автоматизировано **конвейером из субагентов и слэш-команд** (`/pencil-pull`, `/update-ds`, `/make-component`, `/make-page`) — подробности в [`04-web-nextjs/README.md`](04-web-nextjs/README.md) и контракте [`04-web-nextjs/docs/pencil-pipeline.md`](04-web-nextjs/docs/pencil-pipeline.md).

### 05-mobile-rn

React Native приложение на **Expo** (SDK 58, Expo Router). Тот же бэкенд и доменная модель, что у веба, та же архитектура Feature-Sliced Design — но нативные решения: авторизация **Bearer + `expo-secure-store`** напрямую в Nest (без cookie-моста/CORS/CSRF), данные через TanStack Query, стилизация NativeWind, гостевая корзина в AsyncStorage, карта выбора адреса — **Leaflet в WebView**, сборка — EAS Build (APK/AAB). Запуск — Expo Go на устройстве; детали (сетевая гоча, env, тесты, EAS) — [`05-mobile-rn/README.md`](05-mobile-rn/README.md).

## Принципы

- Каждая папка — самостоятельный проект со своим `package.json` / README.
- Общие типы и контракты выносим в shared-пакет, когда появится необходимость (пока — рано).
- Архитектура и решения фиксируются в `01-requirements` и в README соответствующего слоя.

## Запуск всего стека (Docker)

Из корня репозитория:

```bash
docker compose up --build       # postgres + redis + backend (:3001) + web (:3000)
```

- Веб — `http://localhost:3000`, API/Swagger — `http://localhost:3001/api/docs`.
- Детали по вебу (env, auth-мост, карты) — [`04-web-nextjs/README.md`](04-web-nextjs/README.md); по бэку — [`03-backend-nestjs/README.md`](03-backend-nestjs/README.md).
- **Мобилка в Docker не входит** — запускается через Expo Go: `cd 05-mobile-rn && npx expo start` (бэк при этом должен быть поднят; адрес бэка — LAN-IP ПК, см. [`05-mobile-rn/README.md`](05-mobile-rn/README.md)).
