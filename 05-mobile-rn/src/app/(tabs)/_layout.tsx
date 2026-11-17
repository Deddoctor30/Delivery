import { Tabs } from "expo-router";
import { ClipboardList, Home, LayoutGrid, ShoppingCart, User } from "lucide-react-native";
import { useColorScheme } from "nativewind";

import { themeColors } from "@/shared/lib/theme-colors";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const c = themeColors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.mutedForeground,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Главная", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="catalog"
        options={{ title: "Каталог", tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="cart"
        options={{ title: "Корзина", tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: "Заказы", tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Профиль", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
