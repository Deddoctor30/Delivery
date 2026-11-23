import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Product } from "@/entities/product";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  lines: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addItem: (product, quantity = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.product.id === product.id);
          return {
            lines: existing
              ? s.lines.map((l) =>
                  l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l,
                )
              : [...s.lines, { product, quantity }],
          };
        }),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => l.product.id !== productId)
              : s.lines.map((l) => (l.product.id === productId ? { ...l, quantity } : l)),
        })),
      removeItem: (productId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.product.id !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "guest-cart",
      storage: createJSONStorage(() => AsyncStorage), // ⚠️ гостевая корзина в AsyncStorage (не localStorage)
    },
  ),
);

/** Суммарное число единиц товара — для бейджа. */
export function useCartCount() {
  return useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
}
