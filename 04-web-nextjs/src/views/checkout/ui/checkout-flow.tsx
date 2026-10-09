"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { MapPickerCoords } from "@/shared/ui";
import { useCart } from "@/features/cart";
import { createOrderAction, estimateDeliveryAction } from "@/features/checkout";

import { CheckoutForm } from "./checkout-form";
import { CheckoutSummary } from "./checkout-summary";

const DEFAULT_COORDS: MapPickerCoords = { lat: 55.7558, lng: 37.6173 }; // Москва по умолчанию
const FALLBACK_COST = 149;

const schema = z.object({
  street: z.string().min(5, "Укажите улицу и дом"),
  apt: z.string().optional(),
  city: z.string().min(2, "Укажите город"),
  zip: z.string().optional(),
  comment: z.string().optional(),
});
export type CheckoutFormValues = z.infer<typeof schema>;

function pluralDays(n: number): string {
  const d10 = n % 10, d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return "день";
  if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) return "дня";
  return "дней";
}

export function CheckoutFlow() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const [isPending, startTransition] = useTransition();

  const [coords, setCoords] = useState<MapPickerCoords>(DEFAULT_COORDS);
  const [delivery, setDelivery] = useState<{ cost: number; days: number } | null>(null);
  const [, startEstimate] = useTransition();

  // Живой расчёт доставки при смене точки (с дебаунсом).
  useEffect(() => {
    const t = setTimeout(() => {
      startEstimate(async () => {
        const res = await estimateDeliveryAction(coords.lat, coords.lng);
        if (res.ok) setDelivery({ cost: res.estimate.cost, days: res.estimate.days });
      });
    }, 400);
    return () => clearTimeout(t);
  }, [coords.lat, coords.lng]);

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
        deliveryLat: coords.lat,
        deliveryLng: coords.lng,
      });
      if (res.ok) {
        clear();
        toast.success("Заказ оформлен! Ожидайте доставку.", { duration: 4000 });
        router.push("/checkout/success");
      } else {
        toast.error(res.error);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8" noValidate>
      <div className="flex-1">
        <CheckoutForm register={register} errors={errors} coords={coords} onCoordsChange={setCoords} />
      </div>

      <CheckoutSummary
        lines={lines}
        deliveryCost={delivery?.cost ?? FALLBACK_COST}
        deliveryEta={delivery ? `${delivery.days} ${pluralDays(delivery.days)}` : "—"}
        submitting={isPending}
      />
    </form>
  );
}
