import { ProductCard, type Product } from "@/entities/product";
import { useCartStore } from "@/features/cart";

export function ConnectedProductCard({
  product,
  className,
  onPress,
}: {
  product: Product;
  className?: string;
  onPress?: () => void;
}) {
  const quantity = useCartStore((s) => s.lines.find((l) => l.product.id === product.id)?.quantity ?? 0);
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);

  return (
    <ProductCard
      product={product}
      className={className}
      onPress={onPress}
      quantity={quantity}
      onAddToCart={() => addItem(product, 1)}
      onQuantityChange={(v) => setQuantity(product.id, v)}
    />
  );
}
