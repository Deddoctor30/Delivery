export type OrderStatus =
  "created" | "processing" | "assembling" | "shipping" | "delivering" | "completed" | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Создан",
  processing: "В обработке",
  assembling: "Собирается",
  shipping: "В пути",
  delivering: "Доставляется",
  completed: "Завершён",
  cancelled: "Отменён",
};

export type OrderStatusBadgeVariant = "default" | "success" | "warning" | "info" | "error";

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "created",
  "processing",
  "assembling",
  "shipping",
  "delivering",
  "completed",
];

export const ORDER_STATUS_BADGE_VARIANT: Record<OrderStatus, OrderStatusBadgeVariant> = {
  created: "default",
  processing: "success",
  assembling: "warning",
  shipping: "info",
  delivering: "info",
  completed: "success",
  cancelled: "error",
};

export type OrderItem = {
  id: string;
  title: string;
  quantity: number;
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
};
