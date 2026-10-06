"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { CategoryNav, type Category } from "@/widgets/category-nav";

interface CatalogCategoryFilterProps {
  /** Чипы категорий (id = slug; «Все» уже включён). Приходят с сервера. */
  categories: Category[];
}

/**
 * CatalogCategoryFilter — client-остров.
 * Читает activeId (slug) из URL и при выборе категории пушит ?category=<slug>&page=1.
 * CatalogPage (RSC) остаётся чистым: состояние живёт в URL, данные категорий — с сервера.
 */
export function CatalogCategoryFilter({ categories }: CatalogCategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeId = searchParams.get("category") ?? "all";

  function handleSelect(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") {
      params.delete("category");
    } else {
      params.set("category", id);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return <CategoryNav categories={categories} activeId={activeId} onSelect={handleSelect} />;
}
