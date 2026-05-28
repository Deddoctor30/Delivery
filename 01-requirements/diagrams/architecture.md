# Архитектура системы

Высокоуровневая карта сервисов и связей.

```mermaid
flowchart LR
    subgraph Clients["Клиенты"]
        Web["Next.js Web<br/>(SSR/SSG + Client)"]
        Mobile["React Native<br/>(Expo)"]
    end

    subgraph Backend["Backend (NestJS)"]
        API["REST API"]
        Auth["Auth Module<br/>(JWT)"]
        Products["Products / Categories"]
        Cart["Cart"]
        Orders["Orders + State Machine"]
        Delivery["Delivery Calc<br/>(Haversine)"]
        Admin["Admin Module"]
        StaticMod["ServeStaticModule<br/>GET /static/*"]
        Cron["Cron Simulator<br/>(статусы заказов)"]
    end

    subgraph Data["Хранилища"]
        PG[("PostgreSQL<br/>+ pg_trgm")]
        Static["Статика на бэке:<br/>03-backend-nestjs/static<br/>products + avatars"]
    end

    subgraph External["Внешнее (на стороне веба)"]
        Maps["Карты + геокодирование<br/>(провайдер TBD)"]
    end

    Web -->|HTTP/JSON| API
    Mobile -->|HTTP/JSON| API
    Web -.->|выбор адреса| Maps
    Web -->|"next/image →<br/>API/static/..."| StaticMod
    Mobile -->|"expo-image →<br/>API/static/..."| StaticMod

    API --> Auth
    API --> Products
    API --> Cart
    API --> Orders
    API --> Delivery
    API --> Admin

    StaticMod --> Static

    Auth --> PG
    Products --> PG
    Cart --> PG
    Orders --> PG
    Admin --> PG
    Cron --> Orders
```

## Заметки

- **Картинки на бэке — единый источник для веба и мобилки.** Лежат в `03-backend-nestjs/static/` (`products/` и `avatars/`), отдаются через `ServeStaticModule` по `{API}/static/...`. БД хранит только относительные пути.
- **Веб:** `next/image` с доменом бэка в `images.remotePatterns` — кэш и оптимизация Next.js на месте.
- **Мобилка:** `expo-image` с тем же базовым URL, встроенный кэш на устройстве.
- **Никакого дублирования картинок** в коде клиентов — оба слоя ходят за одним URL.
- **Миграция в облако** (Cloudflare R2 / S3 / CDN) — меняется конфигурация бэка или путь монтирования volume; код веба и мобилки не трогается.
- **Загрузка файлов пользователем не поддерживается** — сознательное решение MVP.
- Карты и геокодирование живут на клиенте (веб). Бэкенд хранит только координаты и строку адреса.
- Cron-симулятор продвигает заказы по статусам (см. `order-state-machine.md`).
- Поиск — Postgres ILIKE + расширение `pg_trgm` для нечёткого совпадения.
