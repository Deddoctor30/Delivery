import { ProductCard, type Product } from "@/entities/product";
import { useCart } from "@/features/cart";

export function ConnectedProductCard({
  product,
  className,
  onPress,
}: {
  product: Product;
  className?: string;
  onPress?: () => void;
}) {
  const { lines, addItem, setQuantity } = useCart();
  const quantity = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;

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
