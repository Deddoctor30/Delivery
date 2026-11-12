import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/shared/lib/theme";

export default function Index() {
  const { colorScheme, toggle } = useTheme();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background">
      <Text className="font-inter-bold text-2xl text-foreground">Оболочка готова</Text>
      <Text className="font-sans text-muted-foreground">Тема сейчас: {colorScheme}</Text>
      <Pressable onPress={toggle} className="rounded-lg bg-primary px-6 py-3 active:opacity-80">
        <Text className="font-inter-semibold text-primary-foreground">Переключить тему</Text>
      </Pressable>
    </View>
  );
}
