import { Link, router } from "expo-router";
import { ActivityIndicator, FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard, usePopularProducts, type Product } from "@/entities/product";

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

export function HomeScreen() {
  const popular = usePopularProducts();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-6 py-4">
        <Text className="px-4 font-inter-bold text-3xl text-foreground">Delivery</Text>
        <Link href="/ui-kit">
          <Text className="px-4 font-sans text-primary">→ UI Kit</Text>
        </Link>
        <Showcase title="Популярные" data={popular.data} loading={popular.isLoading} />
      </ScrollView>
    </SafeAreaView>
  );
}
