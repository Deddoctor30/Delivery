import { api } from "@/shared/api/client";
import { ApiError, unwrap } from "@/shared/api/error";
import type { components } from "@/shared/api/schema";
import { formatDateTime } from "@/shared/lib/format";
import { mediaUrl } from "@/shared/lib/media";

import type { Order, OrderItem, OrderStatus } from "../model/types";

type OrderDto = components["schemas"]["OrderDto"];
type OrderSummaryDto = components["schemas"]["OrderSummaryDto"];
type OrderItemDto = components["schemas"]["OrderItemDto"];
type OrderStatusHistoryDto = components["schemas"]["OrderStatusHistoryDto"];

/** Короткий человекочитаемый номер из cuid. */
function orderNumber(id: string): string {
  return id.slice(-6).toUpperCase();
}

function toOrderItem(dto: OrderItemDto): OrderItem {
  return {
    id: dto.id,
    title: dto.product.name,
    quantity: dto.quantity,
    price: Math.round(dto.priceSnapshot / 100),
    imageUrl: mediaUrl(dto.product.imageUrl) ?? undefined,
  };
}

function toTimestamps(history: OrderStatusHistoryDto[]): Partial<Record<OrderStatus, string>> {
  const result: Partial<Record<OrderStatus, string>> = {};
  for (const h of history) result[h.status] = formatDateTime(h.changedAt);
  return result;
}

function toOrderBase(dto: OrderDto | OrderSummaryDto): Omit<Order, "statusTimestamps"> {
  const subtotal = Math.round(dto.totalAmount / 100);
  const deliveryPrice = Math.round(dto.deliveryAmount / 100);
  return {
    id: dto.id,
    number: orderNumber(dto.id),
    createdAt: dto.createdAt,
    status: dto.status,
    items: dto.items.map(toOrderItem),
    subtotal,
    deliveryPrice,
    total: subtotal + deliveryPrice,
    address: dto.deliveryAddress,
  };
}

/** Полный заказ (с историей → метки статусов). */
export function toOrder(dto: OrderDto): Order {
  return { ...toOrderBase(dto), statusTimestamps: toTimestamps(dto.history) };
}

/** Заказ в списке (без истории). */
export function toOrderSummary(dto: OrderSummaryDto): Order {
  return toOrderBase(dto);
}

// ─── Фетчеры (Bearer навешивает middleware клиента) ───────────────────────────

export async function getOrders(
  params: { page?: number; limit?: number } = {},
): Promise<{ items: Order[]; total: number; totalPages: number; page: number }> {
  const { page = 1, limit = 20 } = params;
  const data = await unwrap(api.GET("/api/v1/orders", { params: { query: { page, limit } } }));
  return {
    items: data.items.map(toOrderSummary),
    total: data.total,
    totalPages: data.totalPages,
    page: data.page,
  };
}

/** Один заказ. null при 404/403 (не найден или не владелец). */
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const dto = await unwrap(api.GET("/api/v1/orders/{id}", { params: { path: { id } } }));
    return toOrder(dto);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 403)) return null;
    throw e;
  }
}

/** Отменить заказ (бэк разрешает только created/processing). */
export async function cancelOrder(id: string): Promise<Order> {
  const dto = await unwrap(api.POST("/api/v1/orders/{id}/cancel", { params: { path: { id } } }));
  return toOrder(dto);
}
