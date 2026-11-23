import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, Text, View } from "react-native";

import { useProduct, useSimilarProducts } from "@/entities/product";
import { useCart } from "@/features/cart";
import { formatPrice } from "@/shared/lib/format";
import { Badge, Button, Counter } from "@/shared/ui";
import { ConnectedProductCard } from "@/widgets/product-card";

export function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);
  const { data: similar } = useSimilarProducts(product ?? undefined);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-sans text-muted-foreground">Товар не найден</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* динамический заголовок шапки = название товара */}
      <Stack.Screen options={{ title: product.title }} />

      <ScrollView contentContainerClassName="gap-4 pb-8">
        <View className="h-80 w-full items-center justify-center bg-secondary">
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={150}
            />
          ) : null}
        </View>

        <View className="gap-3 px-4">
          <Text className="font-inter-bold text-2xl text-foreground">{product.title}</Text>

          <View className="flex-row items-center gap-3">
            <Text className="font-inter-bold text-2xl text-foreground">
              {formatPrice(product.price)}
            </Text>
            {product.oldPrice ? (
              <Text className="font-sans text-base text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </Text>
            ) : null}
            {product.discountPercent ? (
              <Badge label={`−${product.discountPercent}%`} variant="discount" />
            ) : null}
          </View>

          {product.description ? (
            <Text className="font-sans text-sm leading-5 text-muted-foreground">
              {product.description}
            </Text>
          ) : null}

          <View className="mt-2 flex-row items-center gap-3">
            <Counter value={qty} onChange={setQty} />
            <Button
              label="В корзину"
              className="flex-1"
              disabled={!product.inStock}
              onPress={() => addItem(product, qty)}
            />
          </View>
        </View>

        {similar && similar.length > 0 ? (
          <View className="gap-3">
            <Text className="px-4 font-inter-bold text-xl text-foreground">Похожие</Text>
            <FlatList
              horizontal
              data={similar}
              keyExtractor={(p) => p.id}
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-4"
              renderItem={({ item }) => (
                <ConnectedProductCard
                  product={item}
                  className="w-40"
                  onPress={() =>
                    router.push({ pathname: "/product/[id]", params: { id: item.id } })
                  }
                />
              )}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
