"use client";

import { Badge } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

import { useCart } from "../model/cart-store";

/** Счётчик товаров в корзине — оверлей-бейдж над иконкой корзины в хедере. */
export function CartBadge({ className }: { className?: string }) {
  const { count } = useCart();
  if (count <= 0) return null;
  return (
    <Badge
      variant="cartBadge"
      className={cn(
        "pointer-events-none absolute right-0 top-1.5 -translate-y-1/2 translate-x-1/2",
        className,
      )}
      aria-label={`${count} товар(ов) в корзине`}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
