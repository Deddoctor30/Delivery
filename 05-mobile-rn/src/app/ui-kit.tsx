import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge, Button, Card, Counter, Input } from "@/shared/ui";

export default function UiKit() {
  const [qty, setQty] = useState(1);
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-3 p-4">
        <Text className="font-inter-bold text-2xl text-foreground">UI Kit</Text>

        <Text className="mt-2 font-inter-semibold text-foreground">Buttons</Text>
        <Button label="Primary" onPress={() => {}} />
        <Button label="Secondary" variant="secondary" onPress={() => {}} />
        <Button label="Outline" variant="outline" onPress={() => {}} />
        <Button label="Ghost" variant="ghost" onPress={() => {}} />
        <Button label="Destructive" variant="destructive" onPress={() => {}} />
        <Button label="Disabled" disabled onPress={() => {}} />
        <Button label="Loading" loading onPress={() => {}} />

        <Text className="mt-2 font-inter-semibold text-foreground">Badges</Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge label="default" />
          <Badge label="success" variant="success" />
          <Badge label="warning" variant="warning" />
          <Badge label="−20%" variant="discount" />
        </View>

        <Text className="mt-2 font-inter-semibold text-foreground">Input</Text>
        <Input placeholder="Введите текст" />

        <Text className="mt-2 font-inter-semibold text-foreground">Counter</Text>
        <Counter value={qty} onChange={setQty} />

        <Text className="mt-2 font-inter-semibold text-foreground">Card</Text>
        <Card>
          <Text className="font-inter-semibold text-card-foreground">Заголовок карточки</Text>
          <Text className="font-sans text-muted-foreground">Контент внутри Card</Text>
        </Card>

        <Button label="← Назад" variant="outline" className="mt-4" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}
