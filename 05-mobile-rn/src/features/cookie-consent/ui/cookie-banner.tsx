import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Cookie } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/shared/ui";

const CONSENT_KEY = "cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(CONSENT_KEY).then((v) => {
      if (!v) setVisible(true);
    });
  }, []);

  async function accept() {
    await AsyncStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <SafeAreaView edges={["bottom"]} pointerEvents="box-none" className="absolute inset-x-0 bottom-0">
      <View className="m-3 gap-3 rounded-xl border border-border bg-card p-4 shadow-lg">
        <View className="flex-row items-center gap-2">
          <Cookie size={18} color="#646a75" />
          <Text className="font-inter-semibold text-sm text-foreground">Мы используем cookie</Text>
        </View>
        <Text className="font-sans text-xs text-muted-foreground">
          Помогают приложению работать корректно и запоминать настройки. Продолжая, вы соглашаетесь с
          политикой.
        </Text>
        <View className="flex-row gap-2">
          <Button
            label="Подробнее"
            variant="outline"
            size="sm"
            className="flex-1"
            onPress={() => router.push("/legal/cookies")}
          />
          <Button label="Принять" size="sm" className="flex-1" onPress={accept} />
        </View>
      </View>
    </SafeAreaView>
  );
}
