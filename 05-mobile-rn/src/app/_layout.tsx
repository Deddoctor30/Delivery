import "../../global.css";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SessionProvider } from "@/features/auth";
import { useCartSync } from "@/features/cart";
import { queryClient } from "@/shared/api/query-client";
import { ThemeProvider } from "@/shared/lib/theme";

SplashScreen.preventAutoHideAsync();

function CartSync() {
  useCartSync();
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SessionProvider>
            <CartSync />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="product/[id]" options={{ headerShown: true, title: "Товар" }} />
              <Stack.Screen name="ui-kit" options={{ headerShown: true, title: "UI Kit" }} />
              <Stack.Screen name="search" options={{ headerShown: true, title: "Поиск" }} />
              <Stack.Screen name="checkout" options={{ headerShown: true, title: "Оформление" }} />
              <Stack.Screen name="checkout/success" options={{ headerShown: false }} />
              <Stack.Screen name="order/[id]" options={{ headerShown: true, title: "Заказ" }} />
            </Stack>
            <StatusBar style="auto" />
          </SessionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
