import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Badge, Button, Counter } from "@/shared/ui";

import type { Product } from "../model/types";
import { memo } from "react";

interface ProductCardProps {
  product: Product;
  quantity?: number;
  onPress?: () => void;
  onAddToCart?: () => void;
  onQuantityChange?: (value: number) => void;
  className?: string;
}

export const ProductCard = memo(function ProductCard({
  product,
  quantity = 0,
  onPress,
  onAddToCart,
  onQuantityChange,
  className,
}: ProductCardProps) {
  const { title, price, oldPrice, imageUrl, discountPercent, inStock = true } = product;

  return (
    <View className={cn("overflow-hidden rounded-xl bg-card", className)}>
      <Pressable onPress={onPress}>
        <View className="h-40 w-full items-center justify-center bg-secondary">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={150}
              cachePolicy="memory-disk"
              recyclingKey={product.id}
            />
          ) : null}
          {discountPercent ? (
            <Badge
              label={`−${discountPercent}%`}
              variant="discount"
              className="absolute left-2 top-2"
            />
          ) : null}
        </View>

        <View className="gap-1 p-3">
          <Text numberOfLines={2} className="font-inter-semibold text-sm text-card-foreground">
            {title}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="font-inter-bold text-base text-foreground">{formatPrice(price)}</Text>
            {oldPrice ? (
              <Text className="font-sans text-xs text-muted-foreground line-through">
                {formatPrice(oldPrice)}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      {/* Кнопка/счётчик корзины появятся, когда прокинем onAddToCart (Этап 13) */}
      {onAddToCart ? (
        <View className="px-3 pb-3">
          {quantity > 0 ? (
            <Counter
              value={quantity}
              min={0}
              onChange={(v) => onQuantityChange?.(v)}
              className="w-full justify-between"
            />
          ) : (
            <Button label="В корзину" size="sm" disabled={!inStock} onPress={onAddToCart} />
          )}
        </View>
      ) : null}
    </View>
  );
})
