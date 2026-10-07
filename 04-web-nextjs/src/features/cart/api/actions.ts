"use server";

import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap, ApiError } from "@/shared/api/error";
import { toCart } from "@/entities/cart";
import type { Cart } from "@/entities/cart";

export type CartActionResult = { ok: true; cart: Cart } | { ok: false; error: string };

function fail(e: unknown): CartActionResult {
  const error = e instanceof ApiError ? e.message : "Не удалось обновить корзину";
  return { ok: false, error };
}

/** Добавить товар (суммируется с уже имеющимся на бэке). */
export async function addItemAction(productId: string, quantity = 1): Promise<CartActionResult> {
  try {
    const dto = await unwrap(
      apiServerAuth.POST("/api/v1/cart/items", { body: { productId, quantity } }),
    );
    return { ok: true, cart: toCart(dto) };
  } catch (e) {
    return fail(e);
  }
}

/** Установить количество позиции (0 — удалить). */
export async function updateItemAction(
  productId: string,
  quantity: number,
): Promise<CartActionResult> {
  try {
    const dto = await unwrap(
      apiServerAuth.PATCH("/api/v1/cart/items/{productId}", {
        params: { path: { productId } },
        body: { quantity },
      }),
    );
    return { ok: true, cart: toCart(dto) };
  } catch (e) {
    return fail(e);
  }
}

/** Удалить позицию. */
export async function removeItemAction(productId: string): Promise<CartActionResult> {
  try {
    const dto = await unwrap(
      apiServerAuth.DELETE("/api/v1/cart/items/{productId}", {
        params: { path: { productId } },
      }),
    );
    return { ok: true, cart: toCart(dto) };
  } catch (e) {
    return fail(e);
  }
}

/** Очистить корзину. */
export async function clearCartAction(): Promise<CartActionResult> {
  try {
    const dto = await unwrap(apiServerAuth.DELETE("/api/v1/cart"));
    return { ok: true, cart: toCart(dto) };
  } catch (e) {
    return fail(e);
  }
}

/** Слить гостевую корзину (localStorage) в бэкенд после логина. */
export async function mergeCartAction(
  items: { productId: string; quantity: number }[],
): Promise<CartActionResult> {
  try {
    const dto = await unwrap(apiServerAuth.POST("/api/v1/cart/merge", { body: { items } }));
    return { ok: true, cart: toCart(dto) };
  } catch (e) {
    return fail(e);
  }
}
