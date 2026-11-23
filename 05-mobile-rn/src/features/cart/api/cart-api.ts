import { api } from "@/shared/api/client";
import { unwrap } from "@/shared/api/error";
import { toProduct } from "@/entities/product";
import type { components } from "@/shared/api/schema";

import type { CartItem } from "../model/cart-store";

type CartDto = components["schemas"]["CartDto"];

/** DTO корзины бэка → доменные строки (цена из копеек в рубли через toProduct). */
export function toCartLines(dto: CartDto): CartItem[] {
  return dto.items.map((i) => ({ product: toProduct(i.product), quantity: i.quantity }));
}

export async function getServerCart(): Promise<CartItem[]> {
  return toCartLines(await unwrap(api.GET("/api/v1/cart")));
}

export async function addServerItem(productId: string, quantity = 1): Promise<CartItem[]> {
  return toCartLines(
    await unwrap(api.POST("/api/v1/cart/items", { body: { productId, quantity } })),
  );
}

export async function updateServerItem(productId: string, quantity: number): Promise<CartItem[]> {
  return toCartLines(
    await unwrap(
      api.PATCH("/api/v1/cart/items/{productId}", {
        params: { path: { productId } },
        body: { quantity }, // 0 = удалить позицию (бэк так трактует)
      }),
    ),
  );
}

export async function removeServerItem(productId: string): Promise<CartItem[]> {
  return toCartLines(
    await unwrap(api.DELETE("/api/v1/cart/items/{productId}", { params: { path: { productId } } })),
  );
}

export async function clearServerCart(): Promise<CartItem[]> {
  return toCartLines(await unwrap(api.DELETE("/api/v1/cart")));
}

/** Слить гостевую корзину в бэк после логина. Бэк требует непустой массив. */
export async function mergeServerCart(
  items: { productId: string; quantity: number }[],
): Promise<CartItem[]> {
  return toCartLines(await unwrap(api.POST("/api/v1/cart/merge", { body: { items } })));
}
