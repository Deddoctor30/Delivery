import { router } from "expo-router";
import { memo, useCallback } from "react";

import { ProductCard, type Product } from "@/entities/product";
import { useCartActions, useItemQuantity } from "@/features/cart";

export const ConnectedProductCard = memo(function ConnectedProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const quantity = useItemQuantity(product.id);
  const { addItem, setQuantity } = useCartActions();

  // Стабильные колбэки — чтобы memo(ProductCard) реально срабатывал.
  const handlePress = useCallback(
    () => router.push({ pathname: "/product/[id]", params: { id: product.id } }),
    [product.id],
  );
  const handleAdd = useCallback(() => addItem(product, 1), [addItem, product]);
  const handleQty = useCallback((v: number) => setQuantity(product.id, v), [setQuantity, product.id]);

  return (
    <ProductCard
      product={product}
      className={className}
      onPress={handlePress}
      quantity={quantity}
      onAddToCart={handleAdd}
      onQuantityChange={handleQty}
    />
  );
});
