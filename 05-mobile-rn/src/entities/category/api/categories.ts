import { api } from "@/shared/api/client";
import { unwrap } from "@/shared/api/error";
import type { components } from "@/shared/api/schema";

import type { Category } from "../model/types";

type CategoryTreeDto = components["schemas"]["CategoryTreeDto"];

export function toCategory(dto: CategoryTreeDto): Category {
  return {
    id: dto.id,
    parentId: dto.parentId,
    slug: dto.slug,
    name: dto.name,
    sortOrder: dto.sortOrder,
    children: dto.children.map(toCategory),
  };
}

/** Верхнеуровневые категории (корни дерева) — для плитки на главной и фильтра каталога. */
export async function getTopCategories(): Promise<Category[]> {
  const data = await unwrap(api.GET("/api/v1/categories"));
  return data.map(toCategory);
}
