import { Suspense } from "react";
import { PackageSearch } from "lucide-react";

import { ProductCard } from "@/entities/product";
import type { Product } from "@/entities/product";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Checkbox,
  EmptyState,
  Skeleton,
} from "@/shared/ui";

import { CatalogCategoryFilter } from "./catalog-category-filter";
import { CatalogPagination } from "./catalog-pagination";
import { CatalogSort } from "./catalog-sort";

// ─── Mock-данные ────────────────────────────────────────────────────────────
// TODO: заменить на реальный API (apiServer из @/shared/api/server)

const ALL_PRODUCTS: Product[] = [
  {
    id: "p01",
    title: "Наушники Sound X3",
    price: 4990,
    oldPrice: 6100,
    discountPercent: 18,
    inStock: true,
  },
  { id: "p02", title: "Робот-пылесос Vac Pro", price: 19800, inStock: true },
  {
    id: "p03",
    title: "Чайник Smart 1.7л",
    price: 2490,
    oldPrice: 2990,
    discountPercent: 17,
    inStock: true,
  },
  { id: "p04", title: "Кофемашина CremaOne", price: 32900, inStock: true },
  {
    id: "p05",
    title: "Смартфон Pixel 9",
    price: 74990,
    oldPrice: 84990,
    discountPercent: 12,
    inStock: true,
  },
  { id: "p06", title: "Планшет Slate 11", price: 38500, inStock: true },
  {
    id: "p07",
    title: "Наушники Bass M2",
    price: 7990,
    oldPrice: 9990,
    discountPercent: 20,
    inStock: true,
  },
  { id: "p08", title: "Колонка Boom 5", price: 5490, inStock: true },
  {
    id: "p09",
    title: "Часы Move 2",
    price: 14990,
    oldPrice: 17990,
    discountPercent: 17,
    inStock: true,
  },
  { id: "p10", title: "Камера Pro 4K", price: 54900, inStock: false },
  { id: "p11", title: "Микрофон Voice X", price: 9990, inStock: true },
  {
    id: "p12",
    title: "Power Bank 20K",
    price: 2990,
    oldPrice: 3490,
    discountPercent: 14,
    inStock: true,
  },
  {
    id: "p13",
    title: "Куртка Winter Pro",
    price: 6490,
    oldPrice: 9200,
    discountPercent: 29,
    inStock: true,
  },
  {
    id: "p14",
    title: "Кроссовки Run Pro",
    price: 5490,
    oldPrice: 6990,
    discountPercent: 21,
    inStock: true,
  },
  {
    id: "p15",
    title: "Книга «Эссенциализм»",
    price: 890,
    oldPrice: 1200,
    discountPercent: 26,
    inStock: true,
  },
  {
    id: "p16",
    title: "Гантели 2×8 кг",
    price: 3290,
    oldPrice: 4100,
    discountPercent: 20,
    inStock: true,
  },
];

// Маппинг category-id (из CategoryNav) → ключевые слова названий
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  electronics: [
    "наушники",
    "робот",
    "чайник",
    "кофемашина",
    "смартфон",
    "планшет",
    "колонка",
    "часы",
    "камера",
    "микрофон",
    "power bank",
  ],
  clothing: ["куртка", "кроссовки"],
  books: ["книга"],
  sport: ["гантели"],
  home: ["чайник", "кофемашина", "робот"],
};

const PAGE_SIZE = 4;

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
    const keywords = CATEGORY_KEYWORDS[opts.category] ?? [];
    if (keywords.length > 0) {
      result = result.filter((p) =>
        keywords.some((kw) => p.title.toLowerCase().includes(kw.toLowerCase())),
      );
    }
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

// ─── Sidebar-фильтры (RSC, статические) ─────────────────────────────────────

/** FilterSection — раздел сайдбара с заголовком и контентом. */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-heading text-[13px] font-semibold text-foreground">{title}</span>
      {children}
    </div>
  );
}

/** FilterCheckRow — строка чекбокса в сайдбаре. */
function FilterCheckRow({
  label,
  count,
  checked,
}: {
  label: string;
  count?: string;
  checked?: boolean;
}) {
  return (
    <label className="flex w-full cursor-pointer items-center gap-2.5">
      <Checkbox defaultChecked={checked} />
      <span className="flex-1 text-[13px] text-foreground">{label}</span>
      {count && <span className="font-mono text-[11px] text-muted-foreground">{count}</span>}
    </label>
  );
}

/**
 * CatalogFilters — статический RSC-сайдбар фильтров.
 *
 * Pencil: Filters frame, w=280, bg=card, cornerRadius=xl, padding=24, gap=16.
 * Разделы: Цена / Подкатегория / Бренд / В наличии.
 * Интерактив (диапазон цены, динамические чекбоксы) — TODO при подключении API.
 */
function CatalogFilters() {
  return (
    <aside className="flex w-[280px] shrink-0 flex-col gap-4 rounded-xl bg-card p-6">
      {/* Заголовок фильтров */}
      <div className="flex items-center justify-between">
        <span className="font-heading text-base font-semibold text-foreground">Фильтры</span>
        <button
          type="button"
          className="text-[12px] text-primary transition-opacity hover:opacity-70"
        >
          Сбросить
        </button>
      </div>

      {/* Цена */}
      <FilterSection title="Цена, ₽">
        <div className="flex gap-2">
          <div className="flex flex-1 items-center rounded-md border border-input bg-muted px-3 py-2">
            <span className="font-mono text-[13px] text-foreground">от 500</span>
          </div>
          <div className="flex flex-1 items-center rounded-md border border-input bg-muted px-3 py-2">
            <span className="font-mono text-[13px] text-foreground">до 35 000</span>
          </div>
        </div>
        {/* Ползунок-диапазон: TODO при подключении интерактивного фильтра */}
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
          <div className="absolute left-0 h-full w-[60%] rounded-full bg-primary" />
        </div>
      </FilterSection>

      {/* Подкатегория */}
      <FilterSection title="Подкатегория">
        <FilterCheckRow label="Смартфоны" count="2 410" checked />
        <FilterCheckRow label="Ноутбуки" count="1 820" />
        <FilterCheckRow label="Наушники" count="3 290" checked />
        <FilterCheckRow label="Планшеты" count="840" />
        <FilterCheckRow label="Аксессуары" count="4 120" />
      </FilterSection>

      {/* Бренд */}
      <FilterSection title="Бренд">
        <FilterCheckRow label="Apple" count="1 240" />
        <FilterCheckRow label="Samsung" count="980" />
        <FilterCheckRow label="Xiaomi" count="720" checked />
        <FilterCheckRow label="Sony" count="460" />
      </FilterSection>

      {/* В наличии */}
      <FilterSection title="В наличии">
        <FilterCheckRow label="Только в наличии" checked />
      </FilterSection>
    </aside>
  );
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
 *   (горизонтальные отступы — в layout.tsx через max-w-[1100px] + px-4)
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
  const filtered = filterProducts(ALL_PRODUCTS, {
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
        {/* Filters sidebar — десктоп */}
        <div className="hidden lg:block">
          <CatalogFilters />
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
