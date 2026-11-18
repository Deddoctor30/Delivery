import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard, useInfiniteProducts } from "@/entities/product";

export function CatalogScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const query = useInfiniteProducts({ categorySlug: category });
  const products = query.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-2">
        <Text className="mb-3 font-inter-bold text-2xl text-foreground">Каталог</Text>

        {query.isLoading ? (
          <ActivityIndicator />
        ) : products.length === 0 ? (
          <Text className="font-sans text-muted-foreground">Ничего не найдено</Text>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(p) => p.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerClassName="gap-3 pb-4"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                className="flex-1"
                onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}
              />
            )}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              query.isFetchingNextPage ? <ActivityIndicator className="py-4" /> : undefined
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
