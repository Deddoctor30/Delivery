"use client";

import { useRouter } from "next/navigation";
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
 * handleDetails → router.push(/orders/{id}) — переход на экран деталей заказа.
 * handleRepeat, handleCancel — placeholder через toast до интеграции с API.
 */
export function OrdersList({ orders }: OrdersListProps) {
  const router = useRouter();

  function handleDetails(id: string) {
    router.push(`/orders/${id}`);
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
