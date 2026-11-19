import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard, useInfiniteProducts } from "@/entities/product";
import { BottomSheet } from "@/shared/ui";

import { CatalogFilters, type CatalogFilterValue } from "./catalog-filters";

export function CatalogScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [filters, setFilters] = useState<CatalogFilterValue>({});
  const [sheetOpen, setSheetOpen] = useState(false);

  const query = useInfiniteProducts({ categorySlug: category, ...filters });
  const products = query.data?.pages.flatMap((p) => p.items) ?? [];

  const activeCount = useMemo(
    () => Object.values(filters).filter((v) => v !== undefined).length,
    [filters],
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-2">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-inter-bold text-2xl text-foreground">Каталог</Text>
          <Pressable
            onPress={() => setSheetOpen(true)}
            className="rounded-lg border border-border px-3 py-1.5 active:opacity-70"
          >
            <Text className="font-sans text-sm text-foreground">
              Фильтры{activeCount ? ` (${activeCount})` : ""}
            </Text>
          </Pressable>
        </View>

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
            ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator className="py-4" /> : undefined}
          />
        )}
      </View>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <CatalogFilters
          value={filters}
          onApply={(v) => {
            setFilters(v);
            setSheetOpen(false);
          }}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}
