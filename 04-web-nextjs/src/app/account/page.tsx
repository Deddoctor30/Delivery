import type { Metadata } from "next";

import { getOrders } from "@/entities/order/api";
import { getFavorites } from "@/entities/favorite/api";
import { AccountPage } from "@/views/account";

export const metadata: Metadata = {
  title: "Личный кабинет — Delivery",
};

/**
 * Роут /account (приватный — guard в proxy.ts).
 * Заказы и избранное тянем на сервере и отдаём пропсами в клиентский AccountPage.
 * Профиль и выход берутся из сессии (клиент).
 */
export default async function AccountRoute() {
  const [{ items: recentOrders, total: ordersCount }, favorites] = await Promise.all([
    getOrders({ limit: 2 }),
    getFavorites(),
  ]);
  return (
    <AccountPage recentOrders={recentOrders} ordersCount={ordersCount} favorites={favorites} />
  );
}
