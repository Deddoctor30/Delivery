import { Link, Stack } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Не найдено" }} />
      <SafeAreaView className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="font-inter-bold text-2xl text-foreground">Страница не найдена</Text>
        <Text className="text-center font-sans text-muted-foreground">
          Возможно, экран был перемещён или удалён.
        </Text>
        <Link href="/">
          <Text className="font-inter-semibold text-primary">На главную</Text>
        </Link>
      </SafeAreaView>
    </>
  );
}
