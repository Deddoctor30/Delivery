import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { usePopularProducts } from "@/entities/product";

export default function Index() {
  const { data, isLoading, error } = usePopularProducts();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-4">
        <Text className="text-center font-sans text-destructive">{String(error)}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4 pt-16">
      <Text className="mb-4 font-inter-bold text-2xl text-foreground">Популярные</Text>
      <FlatList
        data={data}
        keyExtractor={(p) => p.id}
        contentContainerClassName="gap-2"
        renderItem={({ item }) => (
          <View className="rounded-lg bg-card p-4">
            <Text className="font-inter-semibold text-card-foreground">{item.title}</Text>
            <Text className="font-sans text-muted-foreground">{item.price} ₽</Text>
          </View>
        )}
      />
    </View>
  );
}
