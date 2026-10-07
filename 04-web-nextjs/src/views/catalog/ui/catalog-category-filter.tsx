"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { CategoryNav, type Category } from "@/widgets/category-nav";
import { categoryIcon, ALL_CATEGORIES_ICON } from "@/shared/lib/category-icons";

/** Сериализуемые данные чипа категории (без иконки-компонента — приходят с сервера). */
export interface NavCategoryData {
  id: string;
  label: string;
}

interface CatalogCategoryFilterProps {
  /** Чипы категорий (id = slug; «Все» уже включён). Приходят с сервера. */
  categories: NavCategoryData[];
}

/**
 * CatalogCategoryFilter — client-остров.
 * Читает activeId (slug) из URL и при выборе категории пушит ?category=<slug>&page=1.
 * Иконки подставляются здесь (на клиенте) — через RSC→client компонент передать нельзя.
 */
export function CatalogCategoryFilter({ categories }: CatalogCategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeId = searchParams.get("category") ?? "all";

  // Доклеиваем иконки на клиенте (id = slug, кроме «all»).
  const navItems: Category[] = categories.map((c) => ({
    id: c.id,
    label: c.label,
    icon: c.id === "all" ? ALL_CATEGORIES_ICON : categoryIcon(c.id),
  }));

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

  return <CategoryNav categories={navItems} activeId={activeId} onSelect={handleSelect} />;
}
