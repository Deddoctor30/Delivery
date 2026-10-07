"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui";
import type { Order } from "@/entities/order";
import { cancelOrderAction } from "@/features/order";

interface OrderActionsProps {
  order: Pick<Order, "id" | "number" | "status">;
}

/**
 * OrderActions — client-остров кнопок действий на детальном экране заказа.
 *
 * Вынесен из RSC OrderDetailPage, так как содержит обработчики событий.
 * «Отменить заказ» (created/processing) → реальный server action (cancelOrderAction).
 * «Служба поддержки» — placeholder (toast).
 */
export function OrderActions({ order }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { id, number, status } = order;

  const canCancel = status === "created" || status === "processing";

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

  function handleSupport() {
    toast(`Служба поддержки по заказу №${number} — функция в разработке`);
  }

  return (
    <div className="flex flex-wrap gap-3">
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
