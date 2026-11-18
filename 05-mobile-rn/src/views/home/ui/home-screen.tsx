import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ProductCard,
  useDiscountedProducts,
  usePopularProducts,
  useSeasonalProducts,
  type Product,
} from "@/entities/product";
import { useTopCategories, type Category } from "@/entities/category";

function Showcase({ title, data, loading }: { title: string; data?: Product[]; loading: boolean }) {
  return (
    <View className="gap-3">
      <Text className="px-4 font-inter-bold text-xl text-foreground">{title}</Text>
      {loading ? (
        <ActivityIndicator className="self-start px-4" />
      ) : (
        <FlatList
          horizontal
          data={data}
          keyExtractor={(p) => p.id}
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 px-4"
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              className="w-40"
              onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}
            />
          )}
        />
      )}
    </View>
  );
}

function CategoryGrid({ categories, loading }: { categories?: Category[]; loading: boolean }) {
  return (
    <View className="gap-3">
      <Text className="px-4 font-inter-bold text-xl text-foreground">Категории</Text>
      {loading ? (
        <ActivityIndicator className="self-start px-4" />
      ) : (
        <View className="flex-row flex-wrap gap-3 px-4">
          {categories?.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => router.push({ pathname: "/catalog", params: { category: c.slug } })}
              className="min-w-[47%] flex-1 rounded-xl bg-card p-4 active:opacity-80"
            >
              <Text className="font-inter-semibold text-card-foreground">{c.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function HomeScreen() {
  const popular = usePopularProducts();
  const seasonal = useSeasonalProducts();
  const discounted = useDiscountedProducts();
  const categories = useTopCategories();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([popular.refetch(), seasonal.refetch(), discounted.refetch(), categories.refetch()]);
    setRefreshing(false);
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-6 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="px-4 font-inter-bold text-3xl text-foreground">Delivery</Text>
        <Showcase title="Популярные" data={popular.data} loading={popular.isLoading} />
        <Showcase title="Сезонные" data={seasonal.data} loading={seasonal.isLoading} />
        <Showcase title="Со скидкой" data={discounted.data} loading={discounted.isLoading} />
        <CategoryGrid categories={categories.data} loading={categories.isLoading} />
      </ScrollView>
    </SafeAreaView>
  );
}
