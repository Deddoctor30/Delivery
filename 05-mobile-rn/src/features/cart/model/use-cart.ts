import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Product } from "@/entities/product";
// eslint-disable-next-line boundaries/dependencies
import { useSession } from "@/features/auth";

import {
  addServerItem,
  clearServerCart,
  getServerCart,
  removeServerItem,
  updateServerItem,
} from "../api/cart-api";
import { useCartStore, type CartItem } from "./cart-store";

export const CART_QUERY_KEY = ["cart"] as const;

export interface UseCart {
  lines: CartItem[];
  count: number;
  subtotal: number;
  /** Идёт серверная операция (для авторизованного режима). */
  isPending: boolean;
  addItem: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export function useCart(): UseCart {
  const { user } = useSession();
  const isAuth = !!user;
  const qc = useQueryClient();

  // ── гостевой стор (zustand) ───────────────────────────────────────────────
  const guestLines = useCartStore((s) => s.lines);
  const guestAdd = useCartStore((s) => s.addItem);
  const guestSetQty = useCartStore((s) => s.setQuantity);
  const guestRemove = useCartStore((s) => s.removeItem);
  const guestClear = useCartStore((s) => s.clear);

  // ── серверная корзина (TanStack Query) ────────────────────────────────────
  const serverQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: getServerCart,
    enabled: isAuth,
    staleTime: 30_000,
  });
  // мутации кладут свежую корзину из ответа прямо в кеш — без повторного GET
  const setServer = (lines: CartItem[]) => qc.setQueryData(CART_QUERY_KEY, lines);

  const addMut = useMutation({
    mutationFn: (v: { productId: string; quantity: number }) =>
      addServerItem(v.productId, v.quantity),
    onSuccess: setServer,
  });
  const qtyMut = useMutation({
    mutationFn: (v: { productId: string; quantity: number }) =>
      updateServerItem(v.productId, v.quantity),
    onSuccess: setServer,
  });
  const removeMut = useMutation({
    mutationFn: (productId: string) => removeServerItem(productId),
    onSuccess: setServer,
  });
  const clearMut = useMutation({ mutationFn: () => clearServerCart(), onSuccess: setServer });

  const lines = isAuth ? (serverQuery.data ?? []) : guestLines;
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);

  if (isAuth) {
    return {
      lines,
      count,
      subtotal,
      isPending:
        serverQuery.isPending ||
        addMut.isPending ||
        qtyMut.isPending ||
        removeMut.isPending ||
        clearMut.isPending,
      addItem: (product, quantity = 1) => addMut.mutate({ productId: product.id, quantity }),
      setQuantity: (productId, quantity) => qtyMut.mutate({ productId, quantity }),
      removeItem: (productId) => removeMut.mutate(productId),
      clear: () => clearMut.mutate(),
    };
  }

  return {
    lines,
    count,
    subtotal,
    isPending: false,
    addItem: guestAdd,
    setQuantity: guestSetQty,
    removeItem: guestRemove,
    clear: guestClear,
  };
}

/** Число единиц товара — для бейджа на табе (учитывает и гостя, и сервер). */
export function useCartCount(): number {
  return useCart().count;
}
