import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ORDER_STATUS_LABELS,
  OrderCard,
  useCancelOrder,
  useOrders,
  type OrderStatus,
} from "@/entities/order";
import { useSession } from "@/features/auth";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";

type Filter = OrderStatus | "all";
const FILTERS: Filter[] = ["all", "created", "processing", "in_delivery", "completed", "cancelled"];
const FILTER_LABELS: Record<Filter, string> = { all: "Все", ...ORDER_STATUS_LABELS };

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-full border px-3 py-1.5 active:opacity-70",
        active ? "border-primary bg-primary" : "border-border bg-card",
      )}
    >
      <Text
        className={cn(
          "font-inter-medium text-sm ",
          active ? "text-primary-foreground" : "text-foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Список — отдельный компонент: useOrders монтируется только для залогиненного. */
function OrdersList() {
  const { data, isLoading, refetch, isRefetching } = useOrders();
  const cancel = useCancelOrder();
  const [filter, setFilter] = useState<Filter>("all");
  const [cancelId, setCancelId] = useState<string | null>(null);

  const orders = useMemo(() => data?.items ?? [], [data]);
  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  function handleCancel(id: string) {
    Alert.alert("Отменить заказ?", "Это действие необратимо.", [
      { text: "Нет", style: "cancel" },
      {
        text: "Отменить",
        style: "destructive",
        onPress: () => {
          setCancelId(id);
          cancel.mutate(id, {
            onError: (e) =>
              Alert.alert(
                "Не удалось отменить",
                e instanceof Error ? e.message : "Попробуйте позже",
              ),
            onSettled: () => setCancelId(null),
          });
        },
      },
    ]);
  }

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="grow-0"
        contentContainerClassName="items-start gap-2 px-4 pb-2"
      >
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={FILTER_LABELS[f]}
            active={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator className="mt-10" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          contentContainerClassName="gap-3 p-4"
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onDetails={(id) => router.push(`/order/${id}`)}
              onCancel={handleCancel}
              cancelling={cancelId === item.id}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
          }

          ListEmptyComponent={
            <Text className="mt-10 text-center font-sans text-muted-foreground">
              {filter === "all" ? "У вас пока нет заказов" : "Нет заказов с таким статусом"}
            </Text>
          }
        />
      )}
    </>
  );
}

export function OrdersScreen() {
  const { user, loading } = useSession();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Text className="px-4 py-3 font-inter-bold text-2xl text-foreground">Заказы</Text>

      {loading ? (
        <ActivityIndicator className="mt-10" />
      ) : user ? (
        <OrdersList />
      ) : (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="font-inter-bold text-xl text-foreground">Войдите в аккаунт</Text>
          <Text className="text-center font-sans text-muted-foreground">
            Заказы доступны после входа
          </Text>
          <Button label="Войти" onPress={() => router.push("/profile")} />
        </View>
      )}
    </SafeAreaView>
  );
}
