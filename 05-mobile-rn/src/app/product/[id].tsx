import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="font-inter-bold text-xl text-foreground">Товар {id}</Text>
    </View>
  );
}
