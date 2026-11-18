import { api } from "@/shared/api/client";
import { ApiError, unwrap } from "@/shared/api/error";
import type { components } from "@/shared/api/schema";
import { mediaUrl } from "@/shared/lib/media";

import type { Product } from "../model/types";

type ProductDto = components["schemas"]["ProductDto"];

/** DTO бэкенда → доменный Product (цена в копейках → рубли; скидка; stock→inStock). */
export function toProduct(dto: ProductDto): Product {
  const originalPriceRub = Math.round(dto.price / 100);
  const hasDiscount = dto.discountPrice != null && dto.discountPrice < dto.price;
  const currentPrice = hasDiscount ? Math.round(dto.discountPrice! / 100) : originalPriceRub;

  return {
    id: dto.id,
    title: dto.name,
    price: currentPrice,
    oldPrice: hasDiscount ? originalPriceRub : undefined,
    discountPercent: hasDiscount
      ? Math.round((1 - dto.discountPrice! / dto.price) * 100)
      : undefined,
    imageUrl: mediaUrl(dto.imageUrl) ?? undefined,
    inStock: dto.stock > 0,
    category: dto.categoryId,
    description: dto.description || undefined,
  };
}

export interface GetProductsParams {
  categoryId?: string;
  categorySlug?: string;
  search?: string;
  popular?: boolean;
  seasonal?: boolean;
  discounted?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name";
}

/** Список товаров с фильтрами/пагинацией (делегируется бэкенду). */
export async function getProducts(
  params: GetProductsParams = {},
): Promise<{ items: Product[]; total: number; totalPages: number; page: number }> {
  const { page = 1, limit = 20, sort = "newest", minPrice, maxPrice, ...rest } = params;
  const data = await unwrap(
    api.GET("/api/v1/products", {
      params: {
        query: {
          page,
          limit,
          sort,
          ...rest,
          ...(minPrice != null ? { minPrice: Math.round(minPrice * 100) } : {}),
          ...(maxPrice != null ? { maxPrice: Math.round(maxPrice * 100) } : {}),
        },
      },
    }),
  );
  return {
    items: data.items.map(toProduct),
    total: data.total,
    totalPages: data.totalPages,
    page: data.page,
  };
}

/** Один товар по id. null при 404. */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const dto = await unwrap(api.GET("/api/v1/products/{id}", { params: { path: { id } } }));
    return toProduct(dto);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Популярные товары. */
export async function getPopularProducts(limit = 8): Promise<Product[]> {
  const data = await unwrap(api.GET("/api/v1/products/popular"));
  return data.slice(0, limit).map(toProduct);
}

export async function getSeasonalProducts(limit = 8): Promise<Product[]> {
  const { items } = await getProducts({ seasonal: true, limit });
  return items;
}

export async function getDiscountedProducts(limit = 8): Promise<Product[]> {
  const { items } = await getProducts({ discounted: true, limit });
  return items;
}
