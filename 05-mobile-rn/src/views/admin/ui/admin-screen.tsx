import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ORDER_STATUS_LABELS, type Order } from "@/entities/order";
import type { User } from "@/entities/user";
import { useAdminUserOrders, useAdminUsers, useCancelAdminOrder } from "@/features/admin";
import { useSession } from "@/features/auth";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { Button, Input } from "@/shared/ui";

/** Заказы пользователя (грузятся лениво при раскрытии). */
function AdminUserOrders({ userId }: { userId: string }) {
  const { data, isLoading } = useAdminUserOrders(userId);
  const cancel = useCancelAdminOrder();

  if (isLoading) return <ActivityIndicator className="my-3" />;
  const orders: Order[] = data ?? [];
  if (orders.length === 0) {
    return <Text className="py-2 font-sans text-sm text-muted-foreground">Заказов нет</Text>;
  }

  return (
    <View className="gap-2 pt-2">
      {orders.map((o) => {
        const canCancel = o.status === "created" || o.status === "processing";
        return (
          <View key={o.id} className="flex-row items-center gap-2 rounded-lg bg-secondary p-2.5">
            <View className="flex-1">
              <Text className="font-inter-medium text-sm text-foreground">
                #{o.number} · {formatPrice(o.total)}
              </Text>
              <Text className="font-sans text-xs text-muted-foreground">
                {ORDER_STATUS_LABELS[o.status]} · {formatDate(o.createdAt)}
              </Text>
            </View>
            {canCancel && (
              <Button
                label="Отменить"
                variant="destructive"
                size="sm"
                loading={cancel.isPending && cancel.variables?.orderId === o.id}
                onPress={() => cancel.mutate({ orderId: o.id, userId })}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

function AdminUserCard({
  user,
  expanded,
  onToggle,
}: {
  user: User;
  expanded: boolean;
  onToggle: () => void;
}) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Без имени";
  return (
    <View className="rounded-xl bg-card p-4">
      <Pressable onPress={onToggle} className="flex-row items-center gap-2 active:opacity-80">
        <View className="flex-1">
          <Text className="font-inter-semibold text-sm text-card-foreground">{user.email}</Text>
          <Text className="font-sans text-xs text-muted-foreground">
            {name} · {user.role}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} color="#646a75" />
        ) : (
          <ChevronDown size={18} color="#646a75" />
        )}
      </Pressable>
      {expanded && (
        <View className="mt-2 border-t border-border pt-2">
          <AdminUserOrders userId={user.id} />
        </View>
      )}
    </View>
  );
}

/** Список + поиск — отдельный компонент, хуки монтируются только для админа. */
function AdminList() {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 300);
  const { data, isLoading, refetch, isRefetching } = useAdminUsers(debounced);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const users = data?.items ?? [];

  return (
    <>
      <View className="px-4 pb-2">
        <Input
          placeholder="Поиск по email или имени"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>
      {isLoading ? (
        <ActivityIndicator className="mt-10" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerClassName="gap-3 p-4 pt-0"
          renderItem={({ item }) => (
            <AdminUserCard
              user={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
            />
          )}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
          ListEmptyComponent={
            <Text className="mt-10 text-center font-sans text-muted-foreground">Ничего не найдено</Text>
          }
        />
      )}
    </>
  );
}

export function AdminScreen() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 items-center justify-center gap-2 bg-background px-6">
        <Text className="font-inter-bold text-xl text-foreground">Нет доступа</Text>
        <Text className="text-center font-sans text-muted-foreground">
          Раздел доступен только администраторам
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Text className="px-4 py-3 font-inter-bold text-2xl text-foreground">Пользователи</Text>
      <AdminList />
    </SafeAreaView>
  );
}
