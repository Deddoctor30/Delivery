import { router, Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, View } from "react-native";

import { useSearchProducts } from "@/entities/product";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { ConnectedProductCard } from "@/widgets/product-card";

export function SearchScreen() {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 250);
  const canSearch = debounced.trim().length >= 2;
  const { data, isFetching } = useSearchProducts(debounced);
  const products = data?.items ?? [];

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Поиск" }} />
      <View className="flex-1 gap-3 px-4 pt-3">
        <TextInput
          autoFocus
          className="rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground"
          placeholder="Поиск товаров"
          placeholderTextColor="#646a75"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCapitalize="none"
        />

        {!canSearch ? (
          <Text className="font-sans text-muted-foreground">Введите минимум 2 символа</Text>
        ) : isFetching ? (
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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ConnectedProductCard
                product={item}
                className="flex-1"
                onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}
