import type { Metadata } from "next";

import { getAdminUser } from "@/entities/user/api";
import { getAdminUserOrders } from "@/entities/order/api";
import { AdminUserDetailPage, AdminUserNotFound } from "@/views/admin-user-detail";

export const metadata: Metadata = {
  title: "Карточка пользователя — Админка",
};

// Активные статусы (учёт в статистике «активных заказов»).
const ACTIVE_STATUSES = new Set([
  "created",
  "processing",
  "courier_picked_up",
  "in_delivery",
  "arrived",
]);

/**
 * Роут /admin/users/[id] (приватный + только ADMIN — guard в app/admin/layout).
 * Тянем профиль и заказы пользователя на сервере; при отсутствии — «не найден».
 */
export default async function AdminUserDetailRoute(props: PageProps<"/admin/users/[id]">) {
  const { id } = await props.params;

  const user = await getAdminUser(id);
  if (!user) {
    return <AdminUserNotFound userId={id} />;
  }

  // До 100 заказов: достаточно для статистики и клиентской пагинации в карточке.
  const { items: orders, total } = await getAdminUserOrders(id, { limit: 100 });
  const stats = {
    totalOrders: total,
    activeOrders: orders.filter((o) => ACTIVE_STATUSES.has(o.status)).length,
    totalAmount: orders.reduce((sum, o) => sum + o.total, 0),
  };

  return <AdminUserDetailPage user={user} stats={stats} orders={orders} ordersTotal={total} />;
}
