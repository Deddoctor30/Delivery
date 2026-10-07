/** Статусы заказа — совпадают с бэкендом (Prisma enum OrderStatus). */
export type OrderStatus =
  | "created"
  | "processing"
  | "courier_picked_up"
  | "in_delivery"
  | "arrived"
  | "completed"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Создан",
  processing: "В обработке",
  courier_picked_up: "Курьер забрал",
  in_delivery: "В доставке",
  arrived: "Прибыл",
  completed: "Завершён",
  cancelled: "Отменён",
};

export type OrderStatusBadgeVariant = "default" | "success" | "warning" | "info" | "error";

/** Линейная последовательность статусов (без отмены) — для StatusTimeline. */
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "created",
  "processing",
  "courier_picked_up",
  "in_delivery",
  "arrived",
  "completed",
];

export const ORDER_STATUS_BADGE_VARIANT: Record<OrderStatus, OrderStatusBadgeVariant> = {
  created: "default",
  processing: "warning",
  courier_picked_up: "info",
  in_delivery: "info",
  arrived: "info",
  completed: "success",
  cancelled: "error",
};

export type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  /** Цена за единицу, в рублях. */
  price: number;
  imageUrl?: string;
};

export type Order = {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryPrice: number;
  total: number;
  address?: string;
  addressComment?: string;
  paymentMethod?: string;
  /** Временны́е метки по статусам для StatusTimeline (детальный экран). */
  statusTimestamps?: Partial<Record<OrderStatus, string>>;
};
