import type { UserRole } from "@/entities/user";

/** Профиль пользователя — используется на детальной странице /admin/users/[id]. */
export interface AdminUserDetail {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarId: string | null;
  role: UserRole;
  createdAt: string;
}

/** Статистика по заказам — агрегаты для карточки. */
export interface UserOrderStats {
  totalOrders: number;
  activeOrders: number;
  totalAmount: number;
}

/** Параметры пагинации заказов. */
export interface OrdersPageParams {
  page: number;
  limit: number;
}

/** Статусы, при которых заказ можно отменить (активные). */
export const CANCELABLE_STATUSES = [
  "created",
  "processing",
  "courier_picked_up",
  "in_delivery",
  "arrived",
] as const;
