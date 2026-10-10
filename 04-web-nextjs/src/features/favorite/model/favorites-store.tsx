"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { openAuthModal } from "@/shared/lib/auth-modal";

import { addFavoriteAction, removeFavoriteAction } from "../api/actions";

interface FavoritesContextValue {
  ids: Set<string>;
  count: number;
  isAuthenticated: boolean;
  /** Идёт серверная операция (toggle). */
  isPending: boolean;
  isFavorite: (productId: string) => boolean;
  /** Переключить избранное (оптимистично + server action). Гость → приглашение войти. */
  toggle: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({
  isAuthenticated,
  initialIds,
  children,
}: {
  isAuthenticated: boolean;
  initialIds: string[];
  children: ReactNode;
}) {
  const [ids, setIds] = useState<Set<string>>(() => new Set(initialIds));
  const [isPending, startTransition] = useTransition();

  // Синк с серверным состоянием при смене пропса (например, после входа и
  // повторного серверного рендера layout). Клиентские toggle-и layout не
  // перезапускают → ключ не меняется → оптимистичное состояние не затирается.
  // setState из внешнего источника обёрнут в startTransition (react-hooks/set-state-in-effect).
  const initialKey = initialIds.join(",");
  useEffect(() => {
    startTransition(() => setIds(new Set(initialIds)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  const isFavorite = useCallback((productId: string) => ids.has(productId), [ids]);

  const toggle = useCallback(
    (productId: string) => {
      if (!isAuthenticated) {
        // гость → предлагаем войти/зарегистрироваться вместо тоста
        openAuthModal();
        return;
      }
      const wasFav = ids.has(productId);
      // оптимистичное обновление
      setIds((prev) => {
        const next = new Set(prev);
        if (wasFav) next.delete(productId);
        else next.add(productId);
        return next;
      });
      startTransition(async () => {
        const res = wasFav
          ? await removeFavoriteAction(productId)
          : await addFavoriteAction(productId);
        if (res.ok) {
          setIds(new Set(res.ids));
        } else {
          // откат оптимистичного изменения
          setIds((prev) => {
            const next = new Set(prev);
            if (wasFav) next.add(productId);
            else next.delete(productId);
            return next;
          });
          toast.error(res.error);
        }
      });
    },
    [isAuthenticated, ids],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({ ids, count: ids.size, isAuthenticated, isPending, isFavorite, toggle }),
    [ids, isAuthenticated, isPending, isFavorite, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites должен использоваться внутри FavoritesProvider");
  return ctx;
}
