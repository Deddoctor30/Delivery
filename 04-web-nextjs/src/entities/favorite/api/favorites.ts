import "server-only";

import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap } from "@/shared/api/error";
import { toProduct, type Product } from "@/entities/product/@x/favorite";

/**
 * Избранные товары текущего пользователя (приватно, Bearer из куки).
 * Персональные данные → cache: "no-store". Для грида в ЛК.
 */
export async function getFavorites(): Promise<Product[]> {
  const { items } = await unwrap(apiServerAuth.GET("/api/v1/favorites", { cache: "no-store" }));
  return items.map(toProduct);
}

/**
 * Набор id избранного — лёгкий запрос для инициализации клиентского стора
 * (какие сердечки «залиты» по всему каталогу).
 */
export async function getFavoriteIds(): Promise<string[]> {
  const { ids } = await unwrap(apiServerAuth.GET("/api/v1/favorites/ids", { cache: "no-store" }));
  return ids;
}
