import type { CartItem } from "@/entities/cart";

/**
 * Гостевая корзина в localStorage (пользователь не авторизован).
 * Храним снимок позиций (товар + количество), чтобы рендерить корзину без запросов.
 * Цены могут слегка устареть — при логине корзина мёржится на бэк и пересчитывается,
 * checkout всегда считает по серверной корзине.
 */
const KEY = "guest-cart:v1";

export function readGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeGuestCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // квота/приватный режим — молча игнорируем
  }
}

export function clearGuestCart(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
