import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

export function LegalScreen({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt?: string;
  children: ReactNode;
}) {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pb-10">
      <View className="gap-1">
        <Text className="font-inter-bold text-2xl text-foreground">{title}</Text>
        {updatedAt && (
          <Text className="font-sans text-xs text-muted-foreground">Обновлено: {updatedAt}</Text>
        )}
      </View>
      {children}
    </ScrollView>
  );
}

export function LegalH2({ children }: { children: string }) {
  return <Text className="mt-2 font-inter-semibold text-lg text-foreground">{children}</Text>;
}

export function LegalP({ children }: { children: string }) {
  return <Text className="font-sans text-[15px] leading-6 text-muted-foreground">{children}</Text>;
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <View className="gap-2">
      {items.map((it, i) => (
        <View key={i} className="flex-row gap-2">
          <Text className="font-sans text-[15px] leading-6 text-muted-foreground">•</Text>
          <Text className="flex-1 font-sans text-[15px] leading-6 text-muted-foreground">{it}</Text>
        </View>
      ))}
    </View>
  );
}
