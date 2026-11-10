import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background">
      <Text className="text-2xl font-bold text-foreground">Токены работают</Text>
      <View className="rounded-lg bg-primary px-6 py-3">
        <Text className="font-semibold text-primary-foreground">Кнопка-primary</Text>
      </View>
      <Text className="text-muted-foreground">второстепенный текст</Text>
    </View>
  );
}
