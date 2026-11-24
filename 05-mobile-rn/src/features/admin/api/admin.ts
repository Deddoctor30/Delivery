import { toOrderSummary, type Order } from "@/entities/order";
import { toUser, type User } from "@/entities/user";
import { api } from "@/shared/api/client";
import { unwrap } from "@/shared/api/error";

/** Список пользователей (поиск + пагинация). Только ADMIN (гвард на бэке). */
export async function getAdminUsers(
  params: { search?: string; page?: number; limit?: number } = {},
): Promise<{ items: User[]; total: number; totalPages: number }> {
  const { search, page = 1, limit = 30 } = params;
  const data = await unwrap(
    api.GET("/api/v1/admin/users", {
      params: { query: { ...(search ? { search } : {}), page, limit } },
    }),
  );
  return { items: data.items.map(toUser), total: data.total, totalPages: data.totalPages };
}

/** Заказы конкретного пользователя (админ). */
export async function getAdminUserOrders(userId: string): Promise<Order[]> {
  const data = await unwrap(
    api.GET("/api/v1/admin/users/{id}/orders", {
      params: { path: { id: userId }, query: { page: 1, limit: 50 } },
    }),
  );
  return data.items.map(toOrderSummary);
}

/** Отменить заказ из админки. */
export async function cancelAdminOrder(orderId: string): Promise<void> {
  await unwrap(api.POST("/api/v1/admin/orders/{id}/cancel", { params: { path: { id: orderId } } }));
}
