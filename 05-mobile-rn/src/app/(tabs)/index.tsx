import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePopularProducts } from "@/entities/product";

export default function HomeScreen() {
  const { data, isLoading, error } = usePopularProducts();

  // временный диагностический лог
  console.log("popular:", { isLoading, error: error && String(error), count: data?.length });

return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        <Text className="mb-4 font-inter-bold text-2xl text-foreground">Популярные</Text>
        {isLoading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text className="font-sans text-destructive">{String(error)}</Text>
        ) : (
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
        )}
      </View>
    </SafeAreaView>
  );

}
