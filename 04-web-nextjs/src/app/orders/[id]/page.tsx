import { notFound } from "next/navigation";

import { getOrderById } from "@/entities/order";
import { OrderDetailPage } from "@/views/order-detail";

/**
 * Тонкий динамический роут /orders/[id] — детали заказа.
 *
 * Next.js 16: params — Promise, читаем через await props.params.
 * Данные берём из единого mock-источника (@/entities/order).
 * Вся вёрстка и логика — в OrderDetailPage (views/order-detail).
 *
 * Если заказ не найден — вызываем notFound() из next/navigation.
 *
 * Приватная страница: guard в src/proxy.ts перенаправляет
 * неаутентифицированных пользователей на главную (?auth=required).
 * Авторизацию здесь не трогаем.
 */
export default async function OrderDetailRoute(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const order = getOrderById(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailPage order={order} />;
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const order = getOrderById(id);
  return {
    title: order ? `Заказ #${order.number}` : "Заказ не найден",
  };
}
