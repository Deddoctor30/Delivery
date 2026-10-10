"use client";

import type { ReactNode } from "react";

import { ProductCard } from "@/entities/product";
import type { Product } from "@/entities/product";

import { useCart } from "../model/cart-store";

/**
 * ProductCard, подключённая к корзине: количество берётся из стора,
 * «В корзину» и Counter меняют корзину (гость → localStorage, авторизованный → бэк).
 * Кнопку «в избранное» (фича favorite) прокидывают сверху слотом (features→features
 * запрещён) — её передаёт widget product-card.
 */
export function CartProductCard({
  product,
  favoriteSlot,
  className,
}: {
  product: Product;
  favoriteSlot?: ReactNode;
  className?: string;
}) {
  const { lines, addItem, setQuantity } = useCart();
  const quantity = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;

  return (
    <ProductCard
      product={product}
      quantity={quantity}
      className={className}
      favoriteSlot={favoriteSlot}
      onAddToCart={() => addItem(product, 1)}
      onQuantityChange={(v) => setQuantity(product.id, v)}
    />
  );
}
