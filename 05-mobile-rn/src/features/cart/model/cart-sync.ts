import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

// eslint-disable-next-line boundaries/dependencies
import { useSession } from "@/features/auth";

import { useCartStore } from "./cart-store";
import { CART_QUERY_KEY } from "./use-cart";
import { getServerCart, mergeServerCart } from "../api/cart-api";

/**
 * Один раз при переходе гость → авторизован сливает гостевую корзину в бэк
 * и очищает локальную. Монтируется в корневом layout (app-слой).
 */
export function useCartSync() {
  const { user } = useSession();
  const qc = useQueryClient();
  const mergedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      mergedFor.current = null; // разлогин — разрешаем мерж при следующем входе
      return;
    }
    if (mergedFor.current === user.id) return;
    mergedFor.current = user.id;

    const guest = useCartStore.getState().lines;
    void (async () => {
      try {
        const lines =
          guest.length > 0
            ? await mergeServerCart(
                guest.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
              )
            : await getServerCart();
        qc.setQueryData(CART_QUERY_KEY, lines);
        if (guest.length > 0) useCartStore.getState().clear();
      } catch {
        // мерж не удался — серверную корзину подтянет обычный useQuery в useCart
      }
    })();
  }, [user, qc]);
}
