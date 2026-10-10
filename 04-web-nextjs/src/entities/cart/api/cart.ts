import "server-only";

import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap } from "@/shared/api/error";
import { toProduct } from "@/entities/product/@x/cart";
import type { components } from "@/shared/api/schema";

import type { Cart } from "../model/types";

type CartDto = components["schemas"]["CartDto"];

/** Маппит ответ бэкенда в доменную корзину (копейки → рубли через toProduct). */
export function toCart(dto: CartDto): Cart {
  return {
    items: dto.items.map((item) => ({
      product: toProduct(item.product),
      quantity: item.quantity,
    })),
    total: Math.round(dto.total / 100),
  };
}

/**
 * Корзина текущего пользователя (приватно, Bearer из куки).
 * Персональные данные → cache: "no-store".
 */
export async function getCart(): Promise<Cart> {
  const dto = await unwrap(apiServerAuth.GET("/api/v1/cart", { cache: "no-store" }));
  return toCart(dto);
}
