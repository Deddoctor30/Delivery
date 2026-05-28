# ER-диаграмма (доменная модель)

Сущности и связи в БД. Источник правды для будущей схемы Prisma.

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ CartItem : has
    User {
        string id PK
        string email UK
        string phone
        string firstName
        string lastName
        string avatarId "из предустановленного набора"
        string passwordHash
        enum role "client | admin"
        datetime createdAt
    }

    Category ||--o{ Category : parent
    Category ||--o{ Product : contains
    Category {
        string id PK
        string parentId FK
        string slug UK
        string name
        int sortOrder
    }

    Product ||--o{ CartItem : in
    Product ||--o{ OrderItem : in
    Product {
        string id PK
        string categoryId FK
        string name
        string description
        int price
        int discountPrice
        string imageUrl
        int stock
        bool isPopular
        bool isSeasonal
        string season
        datetime createdAt
    }

    CartItem {
        string id PK
        string userId FK
        string productId FK
        int quantity
    }

    Order ||--|{ OrderItem : contains
    Order ||--|{ OrderStatusHistory : has
    Order {
        string id PK
        string userId FK
        enum status
        int totalAmount
        int deliveryAmount
        string deliveryAddress
        float deliveryLat
        float deliveryLng
        int estimatedDays
        bool refunded
        datetime createdAt
        datetime cancelledAt
        datetime completedAt
    }

    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        int priceSnapshot
        int quantity
    }

    OrderStatusHistory {
        string id PK
        string orderId FK
        enum status
        enum source "cron | client | admin"
        datetime changedAt
    }
```

## Заметки

- **`User.role`** — `client` или `admin`. Курьера нет (см. требования v1).
- **`User.avatarId`** — идентификатор аватара из преднастроенного набора (5–10 вариантов). Сами файлы лежат на бэке (`03-backend-nestjs/static/avatars/`) и отдаются через `{API}/static/avatars/...` обоим клиентам. Пользовательская загрузка файлов не поддерживается.
- **`Category.parentId`** — самосвязь для дерева категорий (топ-категория → подкатегории).
- **`Product.price`** хранится в **копейках** (int), чтобы не было проблем с float.
- **`OrderItem.priceSnapshot`** — цена на момент заказа (на случай если цена товара поменяется).
- **`Order.estimatedDays`** — расчётный срок доставки на момент создания.
- **`OrderStatusHistory.source`** — кто инициировал переход (для аудита и UI таймлайна).
- **`CartItem`** хранится только для авторизованных пользователей. Гостевая корзина — в localStorage на клиенте.
