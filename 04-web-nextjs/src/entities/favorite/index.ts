// Клиентобезопасный публичный API сущности favorite.
// Избранное — это товары, поэтому доменный тип переиспользуем из product (через @x).
// Серверные фетчеры (apiServerAuth, server-only) — отдельный вход: @/entities/favorite/api
export type { Product as FavoriteProduct } from "@/entities/product/@x/favorite";
