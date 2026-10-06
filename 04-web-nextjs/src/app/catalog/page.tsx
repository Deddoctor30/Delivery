import { CatalogPage } from "@/views/catalog";

/**
 * Тонкий роут /catalog.
 *
 * Next.js 16: searchParams — Promise, читаем через await.
 * Вся вёрстка и логика — в CatalogPage (views/catalog).
 *
 * URL-параметры:
 *   ?category=goryachee    — slug выбранной категории
 *   ?sort=popular          — сортировка
 *   ?page=2                — страница
 *   ?inStock=1             — только в наличии
 *   ?discount=1            — только со скидкой
 *   ?minPrice=500          — минимальная цена
 *   ?maxPrice=35000        — максимальная цена
 */
export default async function CatalogRoute(props: PageProps<"/catalog">) {
  const sp = await props.searchParams;

  const category = typeof sp.category === "string" ? sp.category : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "popular";
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;
  const inStock = sp.inStock === "1" || sp.inStock === "true";
  const discount = sp.discount === "1" || sp.discount === "true";
  const minPrice =
    typeof sp.minPrice === "string" ? parseInt(sp.minPrice, 10) || undefined : undefined;
  const maxPrice =
    typeof sp.maxPrice === "string" ? parseInt(sp.maxPrice, 10) || undefined : undefined;

  return (
    <CatalogPage
      category={category}
      sort={sort}
      page={page}
      inStock={inStock}
      discount={discount}
      minPrice={minPrice}
      maxPrice={maxPrice}
    />
  );
}
