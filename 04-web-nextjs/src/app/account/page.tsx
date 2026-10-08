import type { Metadata } from "next";

import { getOrders } from "@/entities/order/api";
import { AccountPage } from "@/views/account";

export const metadata: Metadata = {
  title: "Личный кабинет — Delivery",
};

/**
 * Роут /account (приватный — guard в proxy.ts).
 * Заказы тянем на сервере и отдаём пропсами в клиентский AccountPage.
 * Профиль и выход берутся из сессии (клиент).
 */
export default async function AccountRoute() {
  const { items: recentOrders, total: ordersCount } = await getOrders({ limit: 2 });
  return <AccountPage recentOrders={recentOrders} ordersCount={ordersCount} />;
}
