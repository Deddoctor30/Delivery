"use client";

import { toast } from "sonner";

import { OrderCard } from "@/entities/order";
import type { Order } from "@/entities/order";

interface OrdersListProps {
  orders: Order[];
}

/**
 * OrdersList — client-остров списка заказов.
 *
 * Обёртка нужна, чтобы передавать функции-обработчики в OrderCard («use client»)
 * из RSC-родителя OrdersPage (в RSC нельзя сериализовать функции).
 *
 * Обработчики пока дают placeholder-отклик через toast (Toaster смонтирован в layout).
 * TODO: подключить реальную навигацию/API:
 *   details → /orders/{id} (отдельный экран деталей, пока не построен),
 *   repeat  → повторить заказ, cancel → отмена заказа.
 */
export function OrdersList({ orders }: OrdersListProps) {
  function handleDetails(id: string) {
    toast(`Детали заказа №${id} — экран в разработке`);
  }

  function handleRepeat(id: string) {
    toast.success(`Заказ №${id} повторён — товары добавлены в корзину`);
  }

  function handleCancel(id: string) {
    toast.error(`Заказ №${id} отменён`);
  }

  return (
    /* Pencil: список OrderCard (vertical, gap=16) */
    <ul className="flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard
            order={order}
            onDetails={handleDetails}
            onRepeat={handleRepeat}
            onCancel={handleCancel}
          />
        </li>
      ))}
    </ul>
  );
}
