"use client";

/**
 * CheckoutForm — client-остров экрана оформления заказа.
 *
 * Содержит:
 *   1. AddrCard — форма адреса (улица, квартира, город/индекс, комментарий)
 *   2. MapCard — карта выбора адреса (MapPlaceholder), высота 320px
 *
 * RSC-обёртка CheckoutPage держит крошки / заголовок / шаги / структуру колонок,
 * а этот client-остров управляет полями формы.
 *
 * Pencil ztzER → Left (Zt9T0):
 *   AddrCard (A28g7U): fill=$--card, cornerRadius=$--radius-lg, gap=16, p=24
 *     - Title: «Адрес доставки», Geist 16px 600
 *     - Input: Street, Apt, CityRow(City + Zip), Comment
 *   MapCard (c2Ft2): fill=$--card, cornerRadius=$--radius-lg, h=320, clip
 *     - Map: MapPlaceholder (HT7ER), fill_container
 */

import { MapPin } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input, Label, MapPicker, MapPickerCoords } from "@/shared/ui";

import type { CheckoutFormValues } from "./checkout-flow";

interface CheckoutFormProps {
  register: UseFormRegister<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
  coords: MapPickerCoords;
  onCoordsChange: (coords: MapPickerCoords) => void;
  /** Идёт обратное геокодирование выбранной на карте точки. */
  geocoding?: boolean;
}

export function CheckoutForm({
  register,
  errors,
  coords,
  onCoordsChange,
  geocoding,
}: CheckoutFormProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* ── AddrCard ──────────────────────────────────────────────── */}
      {/* Pencil: A28g7U fill=$--card, cornerRadius=$--radius-lg, gap=16, p=24 */}
      <div className="flex flex-col gap-4 rounded-xl bg-card p-6">
        {/* Pencil: AddrTitle Geist 16px 600 foreground */}
        <h2 className="font-heading text-base font-semibold text-foreground">Адрес доставки</h2>

        {/* Pencil: Street — Input/Default, fill_container */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="checkout-street">Улица, дом</Label>
          <Input
            id="checkout-street"
            placeholder="Например, ул. Ленина, д. 10"
            autoComplete="street-address"
            {...register("street")}
          />
          {errors.street && <p className="text-sm text-destructive">{errors.street.message}</p>}
        </div>

        {/* Pencil: Apt — Input/Default, fill_container */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="checkout-apt">Квартира / офис</Label>
          <Input
            id="checkout-apt"
            placeholder="Кв. 42"
            autoComplete="address-line2"
            {...register("apt")}
          />
        </div>

        {/* Pencil: CityRow — gap=16, fill_container; City + Zip side by side */}
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="checkout-city">Город</Label>
            <Input
              id="checkout-city"
              placeholder="Москва"
              autoComplete="address-level2"
              {...register("city")}
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="checkout-zip">Индекс</Label>
            <Input
              id="checkout-zip"
              placeholder="101000"
              autoComplete="postal-code"
              {...register("zip")}
            />
          </div>
        </div>

        {/* Pencil: Comment — Input/Default, fill_container */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="checkout-comment">Комментарий курьеру</Label>
          <Input
            id="checkout-comment"
            placeholder="Код домофона, этаж, пожелания"
            {...register("comment")}
          />
        </div>
      </div>

      {/* ── MapCard ─── выбор точки доставки на карте */}
      <div className="flex flex-col gap-2 overflow-hidden rounded-xl bg-card p-2">
        <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden="true" />
          {geocoding ? "Определяем адрес по точке…" : "Кликните по карте — адрес заполнится сам"}
        </p>
        <div className="overflow-hidden rounded-lg">
          <MapPicker
            value={coords}
            onChange={onCoordsChange}
            height={320}
            className="rounded-none"
          />
        </div>
      </div>
    </div>
  );
}
