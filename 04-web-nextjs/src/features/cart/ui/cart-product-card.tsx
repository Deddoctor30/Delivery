"use client";

import { ProductCard } from "@/entities/product";
import type { Product } from "@/entities/product";

import { useCart } from "../model/cart-store";

/**
 * ProductCard, подключённая к корзине: количество берётся из стора,
 * «В корзину» и Counter меняют корзину (гость → localStorage, авторизованный → бэк).
 */
export function CartProductCard({ product, className }: { product: Product; className?: string }) {
  const { lines, addItem, setQuantity } = useCart();
  const quantity = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;

  return (
    <ProductCard
      product={product}
      quantity={quantity}
      className={className}
      onAddToCart={() => addItem(product, 1)}
      onQuantityChange={(v) => setQuantity(product.id, v)}
    />
  );
}
