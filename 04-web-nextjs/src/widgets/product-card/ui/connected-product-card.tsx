"use client";

import type { Product } from "@/entities/product";
import { CartProductCard } from "@/features/cart";
import { FavoriteButton } from "@/features/favorite";

/**
 * Карточка товара, подключённая и к корзине, и к избранному.
 * Композиция двух фич (cart + favorite) живёт в widget — features→features запрещён.
 * Используется во всех сетках товаров (каталог, главная, поиск, новинки, акции, похожие).
 */
export function ConnectedProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  return (
    <CartProductCard
      product={product}
      className={className}
      favoriteSlot={<FavoriteButton productId={product.id} variant="icon" />}
    />
  );
}
