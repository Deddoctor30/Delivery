import "server-only";

import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap, ApiError } from "@/shared/api/error";
import type { components } from "@/shared/api/schema";

import type { Order, OrderItem, OrderStatus } from "../model/types";

type OrderDto = components["schemas"]["OrderDto"];
type OrderSummaryDto = components["schemas"]["OrderSummaryDto"];
type OrderItemDto = components["schemas"]["OrderItemDto"];
type OrderStatusHistoryDto = components["schemas"]["OrderStatusHistoryDto"];

// ─── Мапперы ─────────────────────────────────────────────────────────────────

/** Короткий человекочитаемый номер заказа из cuid. */
function orderNumber(id: string): string {
  return id.slice(-6).toUpperCase();
}

function toOrderItem(dto: OrderItemDto): OrderItem {
  return {
    id: dto.id,
    title: dto.product.name,
    quantity: dto.quantity,
    price: Math.round(dto.priceSnapshot / 100),
    imageUrl: dto.product.imageUrl || undefined,
  };
}

/** История статусов → { статус: "дд ммм, чч:мм" } для StatusTimeline. */
function toTimestamps(history: OrderStatusHistoryDto[]): Partial<Record<OrderStatus, string>> {
  const result: Partial<Record<OrderStatus, string>> = {};
  for (const h of history) {
    result[h.status] = new Date(h.changedAt).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
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

/** Полный заказ (с историей → statusTimestamps). */
export function toOrder(dto: OrderDto): Order {
  return { ...toOrderBase(dto), statusTimestamps: toTimestamps(dto.history) };
}

/** Заказ в списке (без истории). */
export function toOrderSummary(dto: OrderSummaryDto): Order {
  return toOrderBase(dto);
}

// ─── Фетчеры (приватные — apiServerAuth, no-store) ─────────────────────────────

/** Список заказов текущего пользователя (пагинация). */
export async function getOrders(
  params: { page?: number; limit?: number } = {},
): Promise<{ items: Order[]; total: number; totalPages: number; page: number }> {
  const { page = 1, limit = 20 } = params;
  const data = await unwrap(
    apiServerAuth.GET("/api/v1/orders", {
      params: { query: { page, limit } },
      cache: "no-store",
    }),
  );
  return {
    items: data.items.map(toOrderSummary),
    total: data.total,
    totalPages: data.totalPages,
    page: data.page,
  };
}

/** Заказы пользователя (админ): пагинация. Приватно, только ADMIN. */
export async function getAdminUserOrders(
  userId: string,
  params: { page?: number; limit?: number } = {},
): Promise<{ items: Order[]; total: number; totalPages: number; page: number }> {
  const { page = 1, limit = 20 } = params;
  const data = await unwrap(
    apiServerAuth.GET("/api/v1/admin/users/{id}/orders", {
      params: { path: { id: userId }, query: { page, limit } },
      cache: "no-store",
    }),
  );
  return {
    items: data.items.map(toOrderSummary),
    total: data.total,
    totalPages: data.totalPages,
    page: data.page,
  };
}

/** Один заказ по id. null при 404/403 (не найден или не владелец). */
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const dto = await unwrap(
      apiServerAuth.GET("/api/v1/orders/{id}", {
        params: { path: { id } },
        cache: "no-store",
      }),
    );
    return toOrder(dto);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 403)) return null;
    throw e;
  }
}
