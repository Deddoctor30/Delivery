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

/** Линейная последовательность (без отмены) — для StatusTimeline. */
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "created",
  "processing",
  "courier_picked_up",
  "in_delivery",
  "arrived",
  "completed",
];

export type OrderBadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive";

export const ORDER_STATUS_BADGE_VARIANT: Record<OrderStatus, OrderBadgeVariant> = {
  created: "default",
  processing: "warning",
  courier_picked_up: "secondary",
  in_delivery: "secondary",
  arrived: "secondary",
  completed: "success",
  cancelled: "destructive",
};

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  /** Цена за единицу, в рублях. */
  price: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryPrice: number;
  total: number;
  address?: string;
  /** Метки времени по статусам — для таймлайна (экран деталей). */
  statusTimestamps?: Partial<Record<OrderStatus, string>>;
}
