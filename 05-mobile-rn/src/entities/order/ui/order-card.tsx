import { Text, View } from "react-native";

import { formatDate, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Badge, Button, Card } from "@/shared/ui";

import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS, type Order } from "../model/types";

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between">
      <Text className={bold ? "font-inter-bold text-foreground" : "font-sans text-muted-foreground"}>{label}</Text>
      <Text className={bold ? "font-inter-bold text-foreground" : "font-sans text-foreground"}>{value}</Text>
    </View>
  );
}

export function OrderCard({
  order,
  onDetails,
  onCancel,
  cancelling,
  className,
}: {
  order: Order;
  onDetails?: (id: string) => void;
  onCancel?: (id: string) => void;
  cancelling?: boolean;
  className?: string;
}) {
  const canCancel = order.status === "created" || order.status === "processing";

  return (
    <Card className={cn("gap-3", className)}>
      <View className="flex-row items-center justify-between">
        <Text className="font-inter-bold text-base text-card-foreground">Заказ #{order.number}</Text>
        <Badge
          variant={ORDER_STATUS_BADGE_VARIANT[order.status]}
          label={ORDER_STATUS_LABELS[order.status]}
        />
      </View>

      <View className="gap-1">
        {order.items.slice(0, 3).map((it) => (
          <View key={it.id} className="flex-row items-center gap-2">
            <Text numberOfLines={1} className="flex-1 font-sans text-sm text-foreground">{it.title}</Text>
            <Text className="font-sans text-xs text-muted-foreground">×{it.quantity}</Text>
          </View>
        ))}
        {order.items.length > 3 && (
          <Text className="font-sans text-xs text-muted-foreground">и ещё {order.items.length - 3}…</Text>
        )}
      </View>

      <View className="gap-1.5 border-t border-border pt-3">
        <Row label="Дата" value={formatDate(order.createdAt)} />
        <Row label="Доставка" value={order.deliveryPrice === 0 ? "Бесплатно" : formatPrice(order.deliveryPrice)} />
        <View className="h-px bg-border" />
        <Row label="Итого" value={formatPrice(order.total)} bold />
      </View>

      <View className="flex-row gap-2">
        {onDetails && (
          <Button label="Подробнее" variant="secondary" size="sm" className="flex-1" onPress={() => onDetails(order.id)} />
        )}
        {canCancel && onCancel && (
          <Button label="Отменить" variant="destructive" size="sm" className="flex-1" loading={cancelling} onPress={() => onCancel(order.id)} />
        )}
      </View>
    </Card>
  );
}
