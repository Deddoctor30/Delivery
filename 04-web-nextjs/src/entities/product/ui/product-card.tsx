"use client";

import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Badge, Button, Counter } from "@/shared/ui";

import type { Product } from "../model/types";

export interface ProductCardProps {
  product: Product;
  quantity?: number;
  onAddToCart?: () => void;
  onQuantityChange?: (value: number) => void;
  className?: string;
}

export function ProductCard({
  product,
  quantity = 0,
  onAddToCart,
  onQuantityChange,
  className,
}: ProductCardProps) {
  const { title, price, oldPrice, imageUrl, discountPercent, inStock = true } = product;

  const formattedPrice = price.toLocaleString("ru-RU") + " ₽";
  const formattedOldPrice = oldPrice ? oldPrice.toLocaleString("ru-RU") + " ₽" : null;
  const discountLabel = discountPercent ? `−${discountPercent}%` : null;

  return (
    <div
      className={cn("flex w-60 flex-col overflow-hidden rounded-xl bg-card shadow-sm", className)}
    >
      {/* ImageWrap */}
      <div className="relative flex h-50 w-full items-start justify-between bg-secondary p-2.5">
        {/* Product image */}
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill sizes="240px" className="object-contain p-2.5" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="size-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Discount badge (on top of image layer) */}
        {discountLabel && (
          <Badge variant="discount" className="relative z-10">
            {discountLabel}
          </Badge>
        )}

        {/* Favourite button */}
        <button
          type="button"
          aria-label="Добавить в избранное"
          className="relative z-10 ml-auto flex size-8 items-center justify-center rounded-full bg-card"
        >
          <Heart className="size-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        <p className="font-heading text-sm font-medium text-foreground">{title}</p>

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
