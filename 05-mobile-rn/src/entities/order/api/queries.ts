import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelOrder, getOrderById, getOrders } from "./orders";

export const orderKeys = {
  all: ["orders"] as const,
  list: () => [...orderKeys.all, "list"] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export function useOrders() {
  return useQuery({ queryKey: orderKeys.list(), queryFn: () => getOrders({ limit: 50 }) });
}

/** Деталь заказа. poll=true → фоновая ревалидция каждые 30с (движение статуса). */
export function useOrder(id: string, options?: { poll?: boolean }) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrderById(id),
    enabled: !!id,
    refetchInterval: options?.poll ? 30_000 : false,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: (order) => {
      qc.setQueryData(orderKeys.detail(order.id), order);
      void qc.invalidateQueries({ queryKey: orderKeys.list() });
    },
  });
}
