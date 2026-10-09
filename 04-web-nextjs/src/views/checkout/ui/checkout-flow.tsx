"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { MapPickerCoords } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { formatAddress, type Address } from "@/entities/address";
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
  const d10 = n % 10,
    d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return "день";
  if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) return "дня";
  return "дней";
}

export function CheckoutFlow({ savedAddresses }: { savedAddresses: Address[] }) {
  const router = useRouter();
  const { lines, clear } = useCart();
  const [isPending, startTransition] = useTransition();

  // Предвыбранный адрес: основной, иначе первый (если есть).
  const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];

  const [coords, setCoords] = useState<MapPickerCoords>(
    defaultAddress ? { lat: defaultAddress.lat, lng: defaultAddress.lng } : DEFAULT_COORDS,
  );
  const [selectedId, setSelectedId] = useState<string | null>(defaultAddress?.id ?? null);
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
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultAddress
      ? {
          street: defaultAddress.street,
          city: defaultAddress.city,
          apt: defaultAddress.apt ?? "",
          zip: defaultAddress.zip ?? "",
          comment: defaultAddress.comment ?? "",
        }
      : undefined,
  });

  // Подставить сохранённый адрес в форму + на карту.
  function applyAddress(a: Address) {
    setValue("street", a.street, { shouldValidate: true });
    setValue("city", a.city, { shouldValidate: true });
    setValue("apt", a.apt ?? "");
    setValue("zip", a.zip ?? "");
    setValue("comment", a.comment ?? "");
    setCoords({ lat: a.lat, lng: a.lng });
    setSelectedId(a.id);
  }

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
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8"
      noValidate
    >
      <div className="flex flex-1 flex-col gap-5">
        {/* Сохранённые адреса — быстрый выбор (прячем для гостей/без адресов) */}
        {savedAddresses.length > 0 && (
          <div className="flex flex-col gap-3 rounded-xl bg-card p-6">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Сохранённые адреса
            </h2>
            <div className="flex flex-wrap gap-2">
              {savedAddresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => applyAddress(a)}
                  className={cn(
                    "flex max-w-xs flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors",
                    selectedId === a.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  <span className="text-sm font-medium text-foreground">
                    {a.label || "Адрес"}
                    {a.isDefault && " · основной"}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {formatAddress(a)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <CheckoutForm
          register={register}
          errors={errors}
          coords={coords}
          onCoordsChange={setCoords}
        />
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
