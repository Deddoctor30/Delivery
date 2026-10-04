import type { Order } from "./types";

// TODO: заменить на реальный API.
// Единый временный mock-список заказов пользователя.
// OrderItem.price — цена позиции (за единицу × количество для subtotal).
// Товары маппятся вручную: у Order нет прямой зависимости от Product.

export const MOCK_ORDERS: Order[] = [
  // ── 1. Заказ в пути ──────────────────────────────────────────────────────
  {
    id: "ord-001",
    number: "2418",
    createdAt: "2026-09-28T09:15:00Z",
    status: "shipping",
    items: [
      { id: "oi-001-1", title: "Наушники Sound X3", quantity: 1, price: 4990 },
      { id: "oi-001-2", title: "Power Bank 20K", quantity: 2, price: 2990 },
    ],
    subtotal: 10970,
    deliveryPrice: 0,
    total: 10970,
    address: "г. Москва, ул. Ленина, д. 12, кв. 45",
    paymentMethod: "Карта •••• 4242",
    statusTimestamps: {
      created: "09:15",
      processing: "09:32",
      assembling: "10:04",
      shipping: "10:45",
    },
  },

  // ── 2. Заказ завершён ────────────────────────────────────────────────────
  {
    id: "ord-002",
    number: "2291",
    createdAt: "2026-09-10T14:30:00Z",
    status: "completed",
    items: [
      { id: "oi-002-1", title: "Смартфон Pixel 9", quantity: 1, price: 74990 },
      { id: "oi-002-2", title: "Чайник Smart 1.7л", quantity: 1, price: 2490 },
    ],
    subtotal: 77480,
    deliveryPrice: 0,
    total: 77480,
    address: "г. Москва, ул. Ленина, д. 12, кв. 45",
    paymentMethod: "Карта •••• 4242",
    statusTimestamps: {
      created: "14:30",
      processing: "14:45",
      assembling: "15:10",
      shipping: "16:00",
      delivering: "17:30",
      completed: "18:05",
    },
  },

  // ── 3. Заказ отменён ─────────────────────────────────────────────────────
  {
    id: "ord-003",
    number: "2187",
    createdAt: "2026-08-22T11:00:00Z",
    status: "cancelled",
    items: [{ id: "oi-003-1", title: "Планшет Slate 11", quantity: 1, price: 38500 }],
    subtotal: 38500,
    deliveryPrice: 299,
    total: 38799,
    address: "г. Санкт-Петербург, пр. Невский, д. 88, оф. 5",
    paymentMethod: "СБП",
    statusTimestamps: {
      created: "11:00",
      processing: "11:15",
      cancelled: "12:00",
    },
  },

  // ── 4. Заказ в обработке ─────────────────────────────────────────────────
  {
    id: "ord-004",
    number: "2503",
    createdAt: "2026-10-04T08:45:00Z",
    status: "processing",
    items: [
      { id: "oi-004-1", title: "Куртка Winter Pro", quantity: 1, price: 6490 },
      { id: "oi-004-2", title: "Кроссовки Run Pro", quantity: 1, price: 5490 },
      { id: "oi-004-3", title: "Гантели 2×8 кг", quantity: 1, price: 3290 },
    ],
    subtotal: 15270,
    deliveryPrice: 0,
    total: 15270,
    address: "г. Москва, ул. Ленина, д. 12, кв. 45",
    paymentMethod: "Карта •••• 4242",
    statusTimestamps: {
      created: "08:45",
      processing: "08:52",
    },
  },

  // ── 5. Заказ создан (только что) ─────────────────────────────────────────
  {
    id: "ord-005",
    number: "2512",
    createdAt: "2026-10-04T10:20:00Z",
    status: "created",
    items: [
      { id: "oi-005-1", title: "Колонка Boom 5", quantity: 1, price: 5490 },
      { id: "oi-005-2", title: "Микрофон Voice X", quantity: 1, price: 9990 },
    ],
    subtotal: 15480,
    deliveryPrice: 0,
    total: 15480,
    paymentMethod: "СБП",
    statusTimestamps: {
      created: "10:20",
    },
  },

  // ── 6. Заказ доставляется (финальный этап) ───────────────────────────────
  {
    id: "ord-006",
    number: "2478",
    createdAt: "2026-10-02T16:00:00Z",
    status: "delivering",
    items: [{ id: "oi-006-1", title: "Кофемашина CremaOne", quantity: 1, price: 32900 }],
    subtotal: 32900,
    deliveryPrice: 0,
    total: 32900,
    address: "г. Москва, ул. Ленина, д. 12, кв. 45",
    addressComment: "Домофон 45Б",
    paymentMethod: "Карта •••• 4242",
    statusTimestamps: {
      created: "16:00",
      processing: "16:10",
      assembling: "16:45",
      shipping: "18:00",
      delivering: "19:30",
    },
  },
];

/** Найти заказ по id. */
export function getOrderById(id: string): Order | undefined {
  return MOCK_ORDERS.find((o) => o.id === id);
}
