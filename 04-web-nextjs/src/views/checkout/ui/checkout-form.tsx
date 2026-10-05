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

import { Input, Label, MapPlaceholder } from "@/shared/ui";

export function CheckoutForm() {
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
          />
        </div>

        {/* Pencil: Apt — Input/Default, fill_container */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="checkout-apt">Квартира / офис</Label>
          <Input id="checkout-apt" placeholder="Кв. 42" autoComplete="address-line2" />
        </div>

        {/* Pencil: CityRow — gap=16, fill_container; City + Zip side by side */}
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="checkout-city">Город</Label>
            <Input id="checkout-city" placeholder="Москва" autoComplete="address-level2" />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="checkout-zip">Индекс</Label>
            <Input id="checkout-zip" placeholder="101000" autoComplete="postal-code" />
          </div>
        </div>

        {/* Pencil: Comment — Input/Default, fill_container */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="checkout-comment">Комментарий курьеру</Label>
          <Input id="checkout-comment" placeholder="Код домофона, этаж, пожелания" />
        </div>
      </div>

      {/* ── MapCard ───────────────────────────────────────────────── */}
      {/* Pencil: c2Ft2 fill=$--card, cornerRadius=$--radius-lg, h=320, clip
          Вложен Map (HT7ER) = MapPlaceholder, fill_container x fill_container */}
      <div className="overflow-hidden rounded-xl bg-card">
        <MapPlaceholder height={320} className="rounded-none" />
      </div>
    </div>
  );
}
