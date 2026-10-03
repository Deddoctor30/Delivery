"use client";

/**
 * ProductBuyBlock — client-остров: счётчик количества + кнопка «В корзину»
 * + кнопка «В избранное».
 *
 * Pencil: AddRow gap=12, Counter + Button (fill_container) «В корзину».
 * PriceCard: bg=$--card, rounded-xl, padding=24, gap=16.
 * Кнопки — Button из @/shared/ui (primary / outline).
 */

import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";

import { Badge, Button, Counter } from "@/shared/ui";

interface ProductBuyBlockProps {
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  savingAmount?: number;
  inStock?: boolean;
}

export function ProductBuyBlock({
  price,
  oldPrice,
  discountPercent,
  savingAmount,
  inStock = true,
}: ProductBuyBlockProps) {
  const [qty, setQty] = useState(1);

  const formattedPrice = price.toLocaleString("ru-RU");
  const formattedOld = oldPrice?.toLocaleString("ru-RU");
  const formattedSaving = savingAmount?.toLocaleString("ru-RU");

  return (
    /* Pencil: PriceCard bg=$--card rounded-xl p=24 gap=16 */
    <div className="flex w-full flex-col gap-4 rounded-xl bg-card p-6">
      {/* ── Цены ─────────────────────────────────────────────────────── */}
      {/* Pencil: PriceRow gap=12 alignItems=end */}
      <div className="flex items-end gap-3">
        {/* Pencil: Price font-mono 36px 700 */}
        <span className="font-mono text-[36px] font-bold leading-none text-foreground">
          {formattedPrice} ₽
        </span>
        {formattedOld && (
          /* Pencil: Old font-mono 16px muted-foreground */
          <span className="mb-0.5 font-mono text-base text-muted-foreground line-through">
            {formattedOld} ₽
          </span>
        )}
        {discountPercent && (
          /* Pencil: Discount badge — переиспользуем Badge variant="discount" */
          <Badge variant="discount" className="mb-0.5">
            −{discountPercent}%
          </Badge>
        )}
      </div>

      {/* ── Экономия ─────────────────────────────────────────────────── */}
      {/* Pencil: Save text font-caption 12px $--color-success-foreground */}
      {formattedSaving && (
        <p className="font-caption text-xs text-success-foreground">
          Экономия {formattedSaving} ₽ до 31 мая
        </p>
      )}

      {/* ── Добавить в корзину ───────────────────────────────────────── */}
      {/* Pencil: AddRow gap=12 Counter + Button fill_container */}
      <div className="flex gap-3">
        <Counter value={qty} onValueChange={setQty} min={1} max={99} disabled={!inStock} />
        <Button
          variant="default"
          size="lg"
          disabled={!inStock}
          className="h-auto flex-1 gap-2 rounded-lg px-4 py-3 text-sm font-semibold"
          aria-label="Добавить в корзину"
        >
          <ShoppingBag className="size-4" />В корзину
        </Button>
      </div>

      {/* ── В избранное ──────────────────────────────────────────────── */}
      {/* Pencil: Fav Button/Outline fill_container icon=heart */}
      <Button
        variant="outline"
        size="lg"
        className="h-auto w-full gap-2 rounded-lg px-4 py-3 text-sm font-medium"
        aria-label="Добавить в избранное"
      >
        <Heart className="size-4" />В избранное
      </Button>
    </div>
  );
}
