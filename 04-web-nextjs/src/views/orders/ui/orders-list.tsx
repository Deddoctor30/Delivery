"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { OrderCard } from "@/entities/order";
import type { Order } from "@/entities/order";
import { cancelOrderAction } from "@/features/order";

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
 * handleCancel → реальный server action (cancelOrderAction).
 */
export function OrdersList({ orders }: OrdersListProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleDetails(id: string) {
    router.push(`/orders/${id}`);
  }

  function handleCancel(id: string) {
    startTransition(async () => {
      const res = await cancelOrderAction(id);
      if (res.ok) {
        toast.success("Заказ отменён");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    /* Pencil: список OrderCard (vertical, gap=16) */
    <ul className="flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard order={order} onDetails={handleDetails} onCancel={handleCancel} />
        </li>
      ))}
    </ul>
  );
}
