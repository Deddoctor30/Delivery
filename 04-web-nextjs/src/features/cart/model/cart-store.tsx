"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import type { Product } from "@/entities/product";
import type { CartItem } from "@/entities/cart";

import { readGuestCart, writeGuestCart, clearGuestCart } from "./guest-storage";
import {
  addItemAction,
  updateItemAction,
  removeItemAction,
  clearCartAction,
  mergeCartAction,
  type CartActionResult,
} from "../api/actions";

interface CartContextValue {
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

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  isAuthenticated,
  initialLines,
  children,
}: {
  isAuthenticated: boolean;
  initialLines: CartItem[];
  children: ReactNode;
}) {
  // На сервере и при первом рендере — initialLines (бэк-корзина или []).
  // Гостевой localStorage подхватываем после монтирования (во избежание SSR-mismatch).
  const [lines, setLines] = useState<CartItem[]>(initialLines);
  const [isPending, startTransition] = useTransition();
  const mergedRef = useRef(false);

  // Применяет результат server action: обновляет состояние или показывает ошибку.
  const apply = useCallback((res: CartActionResult) => {
    if (res.ok) setLines(res.cart.items);
    else toast.error(res.error);
  }, []);

  // ── Гидрация / merge при монтировании и смене авторизации ──────────────────
  // setState обёрнут в startTransition: синхронизация с внешним источником
  // (localStorage / бэк), а не каскад рендеров.
  useEffect(() => {
    if (!isAuthenticated) {
      // гость — читаем localStorage
      startTransition(() => setLines(readGuestCart()));
      mergedRef.current = false;
      return;
    }
    // авторизован — один раз сливаем гостевую корзину (если была) в бэк
    if (mergedRef.current) return;
    mergedRef.current = true;

    const guest = readGuestCart();
    if (guest.length === 0) {
      startTransition(() => setLines(initialLines));
      return;
    }
    startTransition(async () => {
      const res = await mergeCartAction(
        guest.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      );
      if (res.ok) {
        setLines(res.cart.items);
        clearGuestCart();
      } else {
        toast.error(res.error);
        setLines(initialLines);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Мутации ────────────────────────────────────────────────────────────────
  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      if (isAuthenticated) {
        startTransition(async () => apply(await addItemAction(product.id, quantity)));
        return;
      }
      setLines((prev) => {
        const existing = prev.find((l) => l.product.id === product.id);
        const next = existing
          ? prev.map((l) =>
              l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l,
            )
          : [...prev, { product, quantity }];
        writeGuestCart(next);
        return next;
      });
    },
    [isAuthenticated, apply],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (isAuthenticated) {
        startTransition(async () => apply(await updateItemAction(productId, quantity)));
        return;
      }
      setLines((prev) => {
        const next =
          quantity <= 0
            ? prev.filter((l) => l.product.id !== productId)
            : prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l));
        writeGuestCart(next);
        return next;
      });
    },
    [isAuthenticated, apply],
  );

  const removeItem = useCallback(
    (productId: string) => {
      if (isAuthenticated) {
        startTransition(async () => apply(await removeItemAction(productId)));
        return;
      }
      setLines((prev) => {
        const next = prev.filter((l) => l.product.id !== productId);
        writeGuestCart(next);
        return next;
      });
    },
    [isAuthenticated, apply],
  );

  const clear = useCallback(() => {
    if (isAuthenticated) {
      startTransition(async () => apply(await clearCartAction()));
      return;
    }
    setLines([]);
    clearGuestCart();
  }, [isAuthenticated, apply]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
    return { lines, count, subtotal, isPending, addItem, setQuantity, removeItem, clear };
  }, [lines, isPending, addItem, setQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart должен использоваться внутри CartProvider");
  return ctx;
}
