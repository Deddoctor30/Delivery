// Клиентобезопасный публичный API сущности product.
// Серверные фетчеры (apiServer, server-only) — отдельный вход: @/entities/product/api
export type { Product } from "./model/types";
export { ProductCard } from "./ui/product-card";
export type { ProductCardProps } from "./ui/product-card";
export type { GetProductsParams } from "./api/products";
