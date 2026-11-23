import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

import {
  ORDER_STATUS_BADGE_VARIANT,
  ORDER_STATUS_LABELS,
  StatusTimeline,
  useCancelOrder,
  useOrder,
} from "@/entities/order";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { Badge, Button } from "@/shared/ui";

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between">
      <Text className={bold ? "font-inter-bold text-foreground" : "font-sans text-muted-foreground"}>{label}</Text>
      <Text className={bold ? "font-inter-bold text-foreground" : "font-sans text-foreground"}>{value}</Text>
    </View>
  );
}

export function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id ?? "", { poll: true });
  const cancel = useCancelOrder();

  function handleCancel() {
    if (!order) return;
    Alert.alert("Отменить заказ?", "Это действие необратимо.", [
      { text: "Нет", style: "cancel" },
      {
        text: "Отменить",
        style: "destructive",
        onPress: () =>
          cancel.mutate(order.id, {
            onError: (e) =>
              Alert.alert("Не удалось отменить", e instanceof Error ? e.message : "Попробуйте позже"),
          }),
      },
    ]);
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="font-inter-bold text-xl text-foreground">Заказ не найден</Text>
        <Button label="К заказам" onPress={() => router.replace("/orders")} />
      </View>
    );
  }

  const canCancel = order.status === "created" || order.status === "processing";

  return (
    <>
      <Stack.Screen options={{ title: `Заказ #${order.number}` }} />
      <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4">
        {/* Статус */}
        <View className="flex-row items-center justify-between rounded-xl bg-card p-4">
          <Text className="font-inter-semibold text-sm text-muted-foreground">Статус</Text>
          <Badge
            variant={ORDER_STATUS_BADGE_VARIANT[order.status]}
            label={ORDER_STATUS_LABELS[order.status]}
          />
        </View>

        {/* Таймлайн */}
        <View className="rounded-xl bg-card p-4">
          <Text className="mb-3 font-inter-semibold text-base text-card-foreground">Статус доставки</Text>
          <StatusTimeline currentStatus={order.status} timestamps={order.statusTimestamps} />
        </View>

        {/* Адрес */}
        {order.address && (
          <View className="gap-1 rounded-xl bg-card p-4">
            <Text className="font-inter-semibold text-base text-card-foreground">Адрес доставки</Text>
            <Text className="font-sans text-sm text-foreground">{order.address}</Text>
          </View>
        )}

        {/* Состав */}
        <View className="gap-3 rounded-xl bg-card p-4">
          <Text className="font-inter-semibold text-base text-card-foreground">Состав заказа</Text>
          {order.items.map((it) => (
            <View key={it.id} className="flex-row items-center gap-3">
              <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                {it.imageUrl ? (
                  <Image source={{ uri: it.imageUrl }} style={{ width: "100%", height: "100%" }} contentFit="contain" />
                ) : null}
              </View>
              <View className="flex-1">
                <Text numberOfLines={2} className="font-sans text-sm text-foreground">{it.title}</Text>
                <Text className="font-sans text-xs text-muted-foreground">
                  {it.quantity} × {formatPrice(it.price)}
                </Text>
              </View>
              <Text className="font-inter-medium text-sm text-foreground">
                {formatPrice(it.price * it.quantity)}
              </Text>
            </View>
          ))}

          <View className="h-px bg-border" />
          <Row label="Товары" value={formatPrice(order.subtotal)} />
          <Row label="Доставка" value={order.deliveryPrice === 0 ? "Бесплатно" : formatPrice(order.deliveryPrice)} />
          <Row label="Дата" value={formatDate(order.createdAt)} />
          <View className="h-px bg-border" />
          <Row label="Итого" value={formatPrice(order.total)} bold />
        </View>

        {canCancel && (
          <Button label="Отменить заказ" variant="destructive" loading={cancel.isPending} onPress={handleCancel} />
        )}
      </ScrollView>
    </>
  );
}
