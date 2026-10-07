// Клиентобезопасный публичный API сущности order.
// Серверные фетчеры (apiServerAuth, server-only) — отдельный вход: @/entities/order/api
export type { Order, OrderItem, OrderStatus, OrderStatusBadgeVariant } from "./model/types";
export {
  ORDER_STATUS_BADGE_VARIANT,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_SEQUENCE,
} from "./model/types";

export { OrderCard } from "./ui/order-card";
export type { OrderCardProps } from "./ui/order-card";
export { StatusTimeline } from "./ui/status-timeline";
export type { StatusTimelineProps } from "./ui/status-timeline";
