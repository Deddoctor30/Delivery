import { Image } from "expo-image";
import { router } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCartStore, type CartItem } from "@/features/cart";
import { Button, Counter } from "@/shared/ui";
import { formatPrice } from "@/shared/lib/format";

const FREE_DELIVERY = 2000;
const DELIVERY_COST = 299;

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between">
      <Text className={bold ? "font-inter-bold text-foreground" : "font-sans text-muted-foreground"}>{label}</Text>
      <Text className={bold ? "font-inter-bold text-foreground" : "font-sans text-foreground"}>{value}</Text>
    </View>
  );
}

function CartRow({
  item,
  onQty,
  onRemove,
}: {
  item: CartItem;
  onQty: (id: string, q: number) => void;
  onRemove: (id: string) => void;
}) {
  const { product, quantity } = item;
  return (
    <View className="flex-row gap-3 rounded-xl bg-card p-3">
      <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-secondary">
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={{ width: "100%", height: "100%" }} contentFit="contain" />
        ) : null}
      </View>
      <View className="flex-1 justify-between">
        <Text numberOfLines={2} className="font-inter-semibold text-sm text-card-foreground">{product.title}</Text>
        <Text className="font-inter-bold text-base text-foreground">{formatPrice(product.price * quantity)}</Text>
        <View className="flex-row items-center justify-between">
          <Counter value={quantity} min={1} onChange={(q) => onQty(product.id, q)} />
          <Pressable onPress={() => onRemove(product.id)} className="p-2 active:opacity-60">
            <Trash2 size={18} color="#d14545" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function CartScreen() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const delivery = subtotal >= FREE_DELIVERY || subtotal === 0 ? 0 : DELIVERY_COST;
  const total = subtotal + delivery;

  if (lines.length === 0) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="font-inter-bold text-xl text-foreground">Корзина пуста</Text>
        <Text className="text-center font-sans text-muted-foreground">Добавьте товары из каталога</Text>
        <Button label="В каталог" onPress={() => router.push("/catalog")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Text className="px-4 py-3 font-inter-bold text-2xl text-foreground">Корзина</Text>
      <FlatList
        data={lines}
        keyExtractor={(l) => l.product.id}
        contentContainerClassName="gap-3 px-4 pb-4"
        renderItem={({ item }) => <CartRow item={item} onQty={setQuantity} onRemove={removeItem} />}
      />
      <View className="gap-2 border-t border-border bg-card px-4 py-4">
        <Row label="Товары" value={formatPrice(subtotal)} />
        <Row label="Доставка" value={delivery === 0 ? "Бесплатно" : formatPrice(delivery)} />
        <Row label="Итого" value={formatPrice(total)} bold />
        <Button label="Оформить" className="mt-2" onPress={() => router.push("/checkout")} />
      </View>
    </SafeAreaView>
  );
}
