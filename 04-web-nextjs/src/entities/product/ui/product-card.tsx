"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { Badge, Button, Counter } from "@/shared/ui";

import type { Product } from "../model/types";

export interface ProductCardProps {
  product: Product;
  quantity?: number;
  onAddToCart?: () => void;
  onQuantityChange?: (value: number) => void;
  /**
   * Слот кнопки «в избранное». Избранное — это фича (features/favorite), а карточка —
   * сущность, поэтому саму кнопку прокидывают сверху (widget). Если не задан —
   * рендерится статичная (неинтерактивная) иконка-заглушка.
   */
  favoriteSlot?: ReactNode;
  className?: string;
}

export function ProductCard({
  product,
  quantity = 0,
  onAddToCart,
  onQuantityChange,
  favoriteSlot,
  className,
}: ProductCardProps) {
  const { id, title, price, oldPrice, imageUrl, discountPercent, inStock = true } = product;

  const href = `/product/${id}`;
  const formattedPrice = price.toLocaleString("ru-RU") + " ₽";
  const formattedOldPrice = oldPrice ? oldPrice.toLocaleString("ru-RU") + " ₽" : null;
  const discountLabel = discountPercent ? `−${discountPercent}%` : null;

  return (
    <div
      className={cn("flex w-full flex-col overflow-hidden rounded-xl bg-card shadow-sm", className)}
    >
      {/* ImageWrap */}
      <div className="relative flex h-50 w-full items-start justify-between bg-secondary p-2.5">
        {/* Clickable image area → product page (sits below badge/fav via z-0) */}
        <Link href={href} aria-label={title} className="absolute inset-0 z-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2.5"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="size-16 text-muted-foreground/30" />
            </span>
          )}
        </Link>

        {/* Discount badge (on top of image layer) */}
        {discountLabel && (
          <Badge variant="discount" className="relative z-10">
            {discountLabel}
          </Badge>
        )}

        {/* Favourite button — слот от widget; иначе статичная заглушка */}
        {favoriteSlot ?? (
          <span
            aria-hidden="true"
            className="relative z-10 ml-auto flex size-8 items-center justify-center rounded-full bg-card"
          >
            <Heart className="size-3.5 text-muted-foreground" />
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        <Link
          href={href}
          className="line-clamp-2 font-heading text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {title}
        </Link>

        {/* PriceRow */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-semibold text-foreground">
            {formattedPrice}
          </span>
          {formattedOldPrice && (
            <span className="font-mono text-xs text-muted-foreground line-through">
              {formattedOldPrice}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3.5 pb-3.5">
        {!inStock ? (
          <Button variant="outline" size="lg" className="w-full" disabled>
            Нет в наличии
          </Button>
        ) : quantity > 0 ? (
          <Counter value={quantity} min={0} onValueChange={onQuantityChange} className="w-full" />
        ) : (
          <Button variant="default" size="lg" className="w-full" onClick={onAddToCart}>
            <ShoppingBag />В корзину
          </Button>
        )}
      </div>
    </div>
  );
}
