import "server-only";

import { apiServer } from "@/shared/api/server";
import { unwrap, ApiError } from "@/shared/api/error";
import type { components } from "@/shared/api/schema";

import type { Product } from "../model/types";

// Типы ответов берём из сгенерированной OpenAPI-схемы (бэкенд их теперь отдаёт).
type ProductDto = components["schemas"]["ProductDto"];

// ─── Маппер DTO → доменный тип ────────────────────────────────────────────────

/**
 * Маппит ответ бэкенда в доменный Product.
 *  - name → title
 *  - price (коп) / 100 → цена в рублях; при скидке discountPrice → price, оригинал → oldPrice
 *  - stock > 0 → inStock; categoryId → category
 *
 * Поля без аналога в бэкенде (specs, rating, reviewsCount, brand, images) остаются undefined.
 */
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
    imageUrl: dto.imageUrl || undefined,
    inStock: dto.stock > 0,
    category: dto.categoryId,
    description: dto.description || undefined,
  };
}

// ─── Параметры списка ──────────────────────────────────────────────────────────

export interface GetProductsParams {
  categoryId?: string;
  /** Slug категории — фильтрует по ней И всем её потомкам (приоритетнее categoryId). */
  categorySlug?: string;
  search?: string;
  popular?: boolean;
  seasonal?: boolean;
  discounted?: boolean;
  /** Только товары в наличии (stock > 0). */
  inStock?: boolean;
  /** Диапазон цены в РУБЛЯХ (конвертируется в копейки при запросе). */
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name";
}

// ─── Фетчеры (публичные чтения — apiServer, кэшируемо) ──────────────────────────

/**
 * Список товаров с фильтрацией/сортировкой/пагинацией — делегируется бэкенду.
 * Фильтры: categoryId, categorySlug, search, popular, seasonal, discounted,
 * inStock, minPrice/maxPrice (в рублях → копейки), page, limit, sort.
 */
export async function getProducts(
  params: GetProductsParams = {},
): Promise<{ items: Product[]; total: number; totalPages: number; page: number }> {
  const { page = 1, limit = 20, sort = "newest", minPrice, maxPrice, ...rest } = params;
  const data = await unwrap(
    apiServer.GET("/api/v1/products", {
      params: {
        query: {
          page,
          limit,
          sort,
          ...rest,
          // цена приходит в рублях → бэкенд хранит копейки
          ...(minPrice != null ? { minPrice: Math.round(minPrice * 100) } : {}),
          ...(maxPrice != null ? { maxPrice: Math.round(maxPrice * 100) } : {}),
        },
      },
      next: { revalidate: 60 },
    }),
  );
  return {
    items: data.items.map(toProduct),
    total: data.total,
    totalPages: data.totalPages,
    page: data.page,
  };
}

/** Один товар по id. Возвращает null при 404. */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const dto = await unwrap(
      apiServer.GET("/api/v1/products/{id}", {
        params: { path: { id } },
        next: { revalidate: 60 },
      }),
    );
    return toProduct(dto);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Популярные товары (isPopular=true). */
export async function getPopularProducts(limit = 8): Promise<Product[]> {
  const data = await unwrap(
    apiServer.GET("/api/v1/products/popular", { next: { revalidate: 60 } }),
  );
  return data.slice(0, limit).map(toProduct);
}

/**
 * Поиск товаров — через /products?search=... (полные товары с ценами).
 * `/search/suggest` отдаёт только id/name/slug и годится лишь для автокомплита.
 * Если q < 2 символов — возвращает [].
 */
export async function searchProducts(query: string, limit = 24): Promise<Product[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const { items } = await getProducts({ search: q, limit });
  return items;
}

/**
 * Похожие товары: из той же категории, исключая текущий; добор остальными до limit.
 * Отдельного эндпоинта нет → строим через getProducts.
 */
export async function getSimilarProducts(
  product: Pick<Product, "id" | "category">,
  limit = 4,
): Promise<Product[]> {
  const base = product.category
    ? await getProducts({ categoryId: product.category, limit: limit + 1, sort: "newest" })
    : await getProducts({ limit: limit + 1, sort: "newest" });

  const filtered = base.items.filter((p) => p.id !== product.id).slice(0, limit);
  if (filtered.length >= limit) return filtered;

  // добираем из всего каталога
  const ids = new Set(filtered.map((p) => p.id));
  ids.add(product.id);
  const extra = await getProducts({ limit: limit * 2, sort: "newest" });
  const more = extra.items.filter((p) => !ids.has(p.id)).slice(0, limit - filtered.length);
  return [...filtered, ...more];
}
