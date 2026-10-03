"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { CategoryNav } from "@/widgets/category-nav";
import { DEFAULT_CATEGORIES } from "@/widgets/category-nav";

/**
 * CatalogCategoryFilter — client-остров.
 * Читает activeId из URL и при выборе категории пушит новый ?category=...&page=1.
 * CatalogPage (RSC) остаётся чистым: состояние живёт в URL.
 */
export function CatalogCategoryFilter() {
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

  return (
    <CategoryNav categories={DEFAULT_CATEGORIES} activeId={activeId} onSelect={handleSelect} />
  );
}
