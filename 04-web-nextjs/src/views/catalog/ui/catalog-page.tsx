import { Suspense } from "react";
import { PackageSearch } from "lucide-react";

import { getProducts } from "@/entities/product/api";
import { CartProductCard } from "@/features/cart";
import { getTopCategories } from "@/entities/category";
import type { NavCategoryData } from "./catalog-category-filter";

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

const PAGE_SIZE = 8;

// ─── Скелетон загрузки ───────────────────────────────────────────────────────

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-70 w-full rounded-xl" />
      ))}
    </div>
  );
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

// ─── CatalogPage (RSC async) ─────────────────────────────────────────────────

/**
 * CatalogPage — экран каталога товаров (RSC).
 *
 * Фильтрация/сортировка/пагинация делегированы бэкенду через getProducts():
 * categorySlug, discounted, inStock, minPrice/maxPrice (рубли), sort, page, limit.
 *
 * Пагинация серверная: строится по total из ответа бэкенда.
 *
 * Клиентские острова (CatalogFilters/Sort/Pagination/CategoryFilter) не меняются.
 */
export async function CatalogPage({
  category,
  sort = "newest",
  page = 1,
  discount = false,
  inStock = false,
  minPrice,
  maxPrice,
}: CatalogPageProps) {
  // Маппим sort из URL-значений на те, что принимает бэкенд
  const apiSort = mapSort(sort);

  const activeSlug = category && category !== "all" ? category : undefined;

  // Категории и товары тянем параллельно
  const [topCategories, productsResult] = await Promise.all([
    getTopCategories(),
    getProducts({
      categorySlug: activeSlug,
      discounted: discount || undefined,
      inStock: inStock || undefined,
      minPrice,
      maxPrice,
      sort: apiSort,
      page,
      limit: PAGE_SIZE,
    }),
  ]);

  const { items: pageProducts, total, totalPages } = productsResult;

  // Чипы навигации: «Все» + верхнеуровневые категории (id = slug).
  // Передаём ТОЛЬКО сериализуемые данные (без иконок-компонентов) — иконки
  // подставит клиентский CatalogCategoryFilter (нельзя слать компонент через RSC→client).
  const navCategories: NavCategoryData[] = [
    { id: "all", label: "Все" },
    ...topCategories.map((c) => ({ id: c.slug, label: c.name })),
  ];

  // Отображаемый заголовок категории — по реальному имени из бэкенда
  const categoryLabel = activeSlug
    ? (topCategories.find((c) => c.slug === activeSlug)?.name ?? activeSlug)
    : "Каталог";

  return (
    <div className="flex flex-col gap-6 py-7 pb-20">
      {/* ── 1. Breadcrumbs ──────────────────────────────────────────── */}
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
      <Suspense fallback={<Skeleton className="h-10 w-full rounded-full" />}>
        <CatalogCategoryFilter categories={navCategories} />
      </Suspense>

      {/* ── 3. TitleRow ─────────────────────────────────────────────── */}
      <div className="flex w-full items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-[36px] font-semibold leading-tight text-foreground">
            {categoryLabel}
          </h1>
          <span className="font-mono text-[13px] text-muted-foreground">
            {total.toLocaleString("ru-RU")} товаров
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-caption text-[13px] text-muted-foreground">Сортировка:</span>
          <Suspense fallback={<Skeleton className="h-10 w-50 rounded-md" />}>
            <CatalogSort />
          </Suspense>
        </div>
      </div>

      {/* ── 4. Cols: Filters + Products ─────────────────────────────── */}
      <div className="flex w-full gap-6">
        {/* Filters sidebar */}
        <div className="hidden lg:block">
          <Suspense fallback={<Skeleton className="h-96 w-70 rounded-xl" />}>
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
              <Suspense fallback={<ProductGridSkeleton />}>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {pageProducts.map((product) => (
                    <CartProductCard key={product.id} product={product} />
                  ))}
                </div>
              </Suspense>

              {/* ── 5. Pagination ───────────────────────────────────── */}
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

/**
 * Маппит значения sort из URL (используемых CatalogSort-островом)
 * на значения, принимаемые бэкендом.
 *
 * URL-значения: popular, price_asc, price_desc, discount, new
 * Бэкенд: newest, price_asc, price_desc, name
 */
function mapSort(sort: string): "newest" | "price_asc" | "price_desc" | "name" {
  switch (sort) {
    case "price_asc":
      return "price_asc";
    case "price_desc":
      return "price_desc";
    case "name":
      return "name";
    case "new":
      return "newest";
    // popular, discount — нет прямого бэкенд-аналога; используем newest
    default:
      return "newest";
  }
}
