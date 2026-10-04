import { Suspense } from "react";
import { PackageSearch } from "lucide-react";

import { ProductCard, MOCK_PRODUCTS } from "@/entities/product";
import type { Product } from "@/entities/product";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  EmptyState,
  Skeleton,
} from "@/shared/ui";

import { CatalogCategoryFilter } from "./catalog-category-filter";
import { CatalogFilters } from "./catalog-filters";
import { CatalogPagination } from "./catalog-pagination";
import { CatalogSort } from "./catalog-sort";

// Товары берём из единого mock-источника (@/entities/product).
// TODO: заменить на реальный API (apiServer из @/shared/api/server)

const PAGE_SIZE = 8;

// ─── Фильтрация и сортировка (демонстрация серверной логики) ─────────────────

function filterProducts(
  products: Product[],
  opts: {
    category?: string;
    inStock?: boolean;
    discount?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sort: string;
  },
): Product[] {
  let result = [...products];

  if (opts.category && opts.category !== "all") {
    result = result.filter((p) => p.category === opts.category);
  }

  if (opts.inStock) {
    result = result.filter((p) => p.inStock);
  }

  if (opts.discount) {
    result = result.filter((p) => (p.discountPercent ?? 0) > 0);
  }

  if (opts.minPrice !== undefined) {
    result = result.filter((p) => p.price >= opts.minPrice!);
  }

  if (opts.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= opts.maxPrice!);
  }

  switch (opts.sort) {
    case "price_asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "discount":
      result.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
      break;
    case "new":
      result.reverse();
      break;
    default: // popular — оставляем порядок mock-данных
      break;
  }

  return result;
}

// ─── Типы пропсов ────────────────────────────────────────────────────────────

export interface CatalogPageProps {
  category?: string;
  sort?: string;
  page?: number;
  inStock?: boolean;
  discount?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

// ─── Скелетон загрузки ───────────────────────────────────────────────────────

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
      ))}
    </div>
  );
}

// ─── CatalogPage (RSC) ───────────────────────────────────────────────────────

/**
 * CatalogPage — экран каталога товаров (RSC).
 *
 * Из Pencil-фрейма uZ4Ex / Body K2wsL:
 *   layout: vertical, gap: 24, padding: [28, 170, 80, 170]
 *   (горизонтальные отступы — в layout.tsx через max-w-[1328px] + px-4)
 *
 * Структура:
 *   1. Breadcrumbs — Главная / Каталог / Электроника
 *   2. CategoryNav (client-остров CatalogCategoryFilter)
 *   3. TitleRow — заголовок + кол-во + сортировка (CatalogSort)
 *   4. Cols — Filters sidebar (w=280) + Products grid (fill)
 *   5. Pagination (CatalogPagination)
 *
 * Фильтры/сортировка/пагинация — через URL (client-острова).
 * CatalogPage остаётся RSC: читает пропсы, пришедшие из роута (await searchParams).
 */
export function CatalogPage({
  category = "all",
  sort = "popular",
  page = 1,
  inStock = false,
  discount = false,
  minPrice,
  maxPrice,
}: CatalogPageProps) {
  const filtered = filterProducts(MOCK_PRODUCTS, {
    category,
    inStock,
    discount,
    minPrice,
    maxPrice,
    sort,
  });

  // Пагинация по mock-данным (демонстрация логики)
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageProducts = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Отображаемый заголовок категории
  const categoryLabel =
    category && category !== "all" ? (DEFAULT_CATEGORY_LABELS[category] ?? "Каталог") : "Каталог";

  const productCount = filtered.length;

  return (
    <div className="flex flex-col gap-6 py-7 pb-20">
      {/* ── 1. Breadcrumbs ──────────────────────────────────────────── */}
      {/* Pencil: y1YZD Breadcrumbs, gap=8, alignItems=center */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/catalog">Каталог</BreadcrumbLink>
          </BreadcrumbItem>
          {category && category !== "all" && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{categoryLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── 2. CategoryNav ──────────────────────────────────────────── */}
      {/* Client-остров: читает/пишет ?category= */}
      <Suspense fallback={<Skeleton className="h-10 w-full rounded-full" />}>
        <CatalogCategoryFilter />
      </Suspense>

      {/* ── 3. TitleRow ─────────────────────────────────────────────── */}
      {/* Pencil: UFTlj TitleRow, justifyContent=space_between, alignItems=end */}
      <div className="flex w-full items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          {/* Pencil: T=36px Geist 600, C=13px Geist Mono muted */}
          <h1 className="font-heading text-[36px] font-semibold leading-tight text-foreground">
            {categoryLabel}
          </h1>
          <span className="font-mono text-[13px] text-muted-foreground">
            {productCount.toLocaleString("ru-RU")} товаров
          </span>
        </div>
        {/* Pencil: R → L "Сортировка:" caption 13, Sort=Select w=200 */}
        <div className="flex items-center gap-2">
          <span className="font-caption text-[13px] text-muted-foreground">Сортировка:</span>
          <Suspense fallback={<Skeleton className="h-10 w-[200px] rounded-md" />}>
            <CatalogSort />
          </Suspense>
        </div>
      </div>

      {/* ── 4. Cols: Filters + Products ─────────────────────────────── */}
      {/* Pencil: Y8INV Cols, gap=24 */}
      <div className="flex w-full gap-6">
        {/* Filters sidebar — десктоп (client-остров: пишет фильтры в URL) */}
        <div className="hidden lg:block">
          <Suspense fallback={<Skeleton className="h-96 w-[280px] rounded-xl" />}>
            <CatalogFilters
              inStock={inStock}
              discount={discount}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </Suspense>
        </div>

        {/* Products area */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {pageProducts.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="size-20 text-muted-foreground/40" />}
              title="Ничего не найдено"
              description="Попробуйте изменить параметры фильтра или выбрать другую категорию."
            />
          ) : (
            <>
              {/* Pencil: Products grid — 4 колонки, gap=16 */}
              <Suspense fallback={<ProductGridSkeleton />}>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {pageProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </Suspense>

              {/* ── 5. Pagination ───────────────────────────────────────── */}
              {/* Pencil: cpPxB Pagination, gap=6, justifyContent=center */}
              <Suspense fallback={<Skeleton className="mx-auto h-10 w-64 rounded-md" />}>
                <CatalogPagination totalPages={totalPages} currentPage={page} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Метки для breadcrumbs и заголовка страницы. */
const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  electronics: "Электроника",
  clothing: "Одежда",
  home: "Дом и сад",
  books: "Книги",
  sport: "Спорт",
  food: "Продукты",
};
