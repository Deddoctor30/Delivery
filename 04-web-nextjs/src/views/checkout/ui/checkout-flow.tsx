"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useCart } from "@/features/cart";
import { createOrderAction } from "@/features/checkout";

import { CheckoutForm } from "./checkout-form";
import { CheckoutSummary } from "./checkout-summary";

/* ── Константы ─────────────────────────────────────────────────── */
const DELIVERY_COST = 149; // отображение; бэк считает фактическую доставку сам
const DELIVERY_ETA = "~35 мин";
// Координаты пока фиксированные (карта — placeholder). TODO: выбор точки на карте.
const DEFAULT_COORDS = { lat: 55.7558, lng: 37.6173 };

const schema = z.object({
  street: z.string().min(5, "Укажите улицу и дом"),
  apt: z.string().optional(),
  city: z.string().min(2, "Укажите город"),
  zip: z.string().optional(),
  comment: z.string().optional(),
});
export type CheckoutFormValues = z.infer<typeof schema>;

/**
 * CheckoutFlow — client-остров оформления: форма адреса (RHF) + сводка + создание заказа.
 * Позиции и суммы берутся из стора корзины. «Оплатить» → createOrderAction → /checkout/success.
 */
export function CheckoutFlow() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    if (lines.length === 0) {
      toast.error("Корзина пуста");
      return;
    }
    const deliveryAddress = [
      values.city,
      values.street,
      values.apt && `кв./оф. ${values.apt}`,
      values.zip,
      values.comment,
    ]
      .filter(Boolean)
      .join(", ");

    startTransition(async () => {
      const res = await createOrderAction({
        deliveryAddress,
        deliveryLat: DEFAULT_COORDS.lat,
        deliveryLng: DEFAULT_COORDS.lng,
      });
      if (res.ok) {
        clear(); // бэк уже очистил серверную корзину; синхронизируем стор
        toast.success("Заказ оформлен! Ожидайте доставку.", { duration: 4000 });
        router.push("/checkout/success");
      } else {
        toast.error(res.error);
      }
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8"
      noValidate
    >
      {/* Левая колонка: форма адреса + карта */}
      <div className="flex-1">
        <CheckoutForm register={register} errors={errors} />
      </div>

      {/* Правая колонка: сводка + оплата */}
      <CheckoutSummary
        lines={lines}
        deliveryCost={DELIVERY_COST}
        deliveryEta={DELIVERY_ETA}
        submitting={isPending}
      />
    </form>
  );
}
