"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/shared/ui";
import type { Order } from "@/entities/order";
import { cancelOrderAction } from "@/features/order";
import { useCart } from "@/features/cart";

interface OrderActionsProps {
  order: Pick<Order, "id" | "number" | "status">;
}

/**
 * OrderActions — client-остров кнопок действий на детальном экране заказа.
 *
 * Вынесен из RSC OrderDetailPage, так как содержит обработчики событий.
 * «Отменить заказ» (created/processing) → cancelOrderAction.
 * «Повторить заказ» (completed/cancelled) → cart.repeatOrder + переход в корзину.
 * «Служба поддержки» — placeholder (toast).
 */
export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const { repeatOrder } = useCart();
  const [isPending, startTransition] = useTransition();
  const { id, number, status } = order;

  const canCancel = status === "created" || status === "processing";
  const canRepeat = status === "completed" || status === "cancelled";

  function handleCancel() {
    startTransition(async () => {
      const res = await cancelOrderAction(id);
      if (res.ok) {
        toast.success(`Заказ №${number} отменён`);
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleRepeat() {
    startTransition(async () => {
      const res = await repeatOrder(id);
      if (res.ok) {
        toast.success("Товары из заказа добавлены в корзину");
        router.push("/cart");
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleSupport() {
    toast(`Служба поддержки по заказу №${number} — функция в разработке`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {canRepeat && (
        <Button variant="outline" onClick={handleRepeat} disabled={isPending}>
          {isPending ? "Добавляем…" : "Повторить заказ"}
        </Button>
      )}
      {canCancel && (
        <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
          {isPending ? "Отмена…" : "Отменить заказ"}
        </Button>
      )}
      <Button variant="secondary" onClick={handleSupport}>
        Служба поддержки
      </Button>
    </div>
  );
}
