"use client";

import { Heart } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";

import { useFavorites } from "../model/favorites-store";

interface FavoriteButtonProps {
  productId: string;
  /** icon — круглая кнопка-сердечко (карточка товара); full — широкая outline-кнопка с подписью. */
  variant?: "icon" | "full";
  className?: string;
}

/**
 * Кнопка «в избранное», подключённая к стору favorites.
 * Гость → приглашение войти (toast внутри стора). Оптимистичный toggle.
 */
export function FavoriteButton({ productId, variant = "icon", className }: FavoriteButtonProps) {
  const { isFavorite, toggle, isPending } = useFavorites();
  const active = isFavorite(productId);
  const label = active ? "Убрать из избранного" : "Добавить в избранное";

  if (variant === "full") {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={() => toggle(productId)}
        disabled={isPending}
        aria-pressed={active}
        aria-label={label}
        className={cn(
          "h-auto w-full gap-2 rounded-lg px-4 py-3 text-sm font-medium",
          active && "border-primary text-primary",
          className,
        )}
      >
        <Heart className={cn("size-4", active && "fill-current")} />
        {active ? "В избранном" : "В избранное"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      disabled={isPending}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "relative z-10 ml-auto flex size-8 items-center justify-center rounded-full bg-card transition-colors",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-3.5 transition-colors",
          active ? "fill-primary text-primary" : "text-muted-foreground",
        )}
      />
    </button>
  );
}
