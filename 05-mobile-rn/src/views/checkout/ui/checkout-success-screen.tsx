import { router } from "expo-router";
import { CircleCheck } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/shared/ui";

export function CheckoutSuccessScreen() {
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 items-center justify-center gap-4 bg-background px-6">
      <CircleCheck size={72} color="#22c55e" />
      <Text className="font-inter-bold text-2xl text-foreground">Заказ оформлен!</Text>
      <Text className="text-center font-sans text-muted-foreground">
        Мы приняли заказ и скоро начнём его собирать. Следить за статусом можно в разделе «Заказы».
      </Text>
      <View className="mt-2 w-full gap-2">
        <Button label="К моим заказам" onPress={() => router.replace("/orders")} />
        <Button label="На главную" variant="outline" onPress={() => router.replace("/")} />
      </View>
    </SafeAreaView>
  );
}
