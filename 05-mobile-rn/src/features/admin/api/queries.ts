import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelAdminOrder, getAdminUserOrders, getAdminUsers } from "./admin";

export const adminKeys = {
  users: (search: string) => ["admin", "users", search] as const,
  userOrders: (id: string) => ["admin", "user-orders", id] as const,
};

export function useAdminUsers(search: string) {
  return useQuery({
    queryKey: adminKeys.users(search),
    queryFn: () => getAdminUsers({ search: search || undefined }),
  });
}

/** Заказы пользователя — лениво: запрос только когда userId задан (аккордеон раскрыт). */
export function useAdminUserOrders(userId: string | null) {
  return useQuery({
    queryKey: adminKeys.userOrders(userId ?? ""),
    queryFn: () => getAdminUserOrders(userId as string),
    enabled: !!userId,
  });
}

export function useCancelAdminOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { orderId: string; userId: string }) => cancelAdminOrder(v.orderId),
    onSuccess: (_data, v) => void qc.invalidateQueries({ queryKey: adminKeys.userOrders(v.userId) }),
  });
}
