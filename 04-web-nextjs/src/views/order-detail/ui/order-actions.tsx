"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/shared/ui";
import type { Order } from "@/entities/order";

interface OrderActionsProps {
  order: Pick<Order, "number" | "status">;
}

/**
 * OrderActions — client-остров кнопок действий на детальном экране заказа.
 *
 * Вынесен из RSC OrderDetailPage, так как содержит обработчики событий.
 * Действия: «Отменить заказ» (created/processing), «Повторить заказ» (completed/cancelled),
 * «Служба поддержки» (всегда).
 * До интеграции с реальным API — placeholder-отклик через toast (sonner).
 */
export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const { number, status } = order;

  const canCancel = status === "created" || status === "processing";
  const canRepeat = status === "completed" || status === "cancelled";

  function handleCancel() {
    toast.error(`Заказ №${number} отменён`);
  }

  function handleRepeat() {
    toast.success(`Заказ №${number} повторён — товары добавлены в корзину`);
    router.push("/cart");
  }

  function handleSupport() {
    toast(`Служба поддержки по заказу №${number} — функция в разработке`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {canRepeat && (
        <Button variant="outline" onClick={handleRepeat}>
          Повторить заказ
        </Button>
      )}
      {canCancel && (
        <Button variant="destructive" onClick={handleCancel}>
          Отменить заказ
        </Button>
      )}
      <Button variant="secondary" onClick={handleSupport}>
        Служба поддержки
      </Button>
    </div>
  );
}
