import "server-only";

import { apiServer } from "@/shared/api/server";
import { unwrap, ApiError } from "@/shared/api/error";
import type { components } from "@/shared/api/schema";

import type { Category } from "../model/types";

type CategoryTreeDto = components["schemas"]["CategoryTreeDto"];
type CategoryDetailDto = components["schemas"]["CategoryDetailDto"];

// ─── Мапперы DTO → доменный тип ─────────────────────────────────────────────

/** Рекурсивно маппит узел дерева категорий. */
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

// ─── Фетчеры (публичные чтения — apiServer, кэшируемо) ──────────────────────

/**
 * Полное дерево категорий (верхнеуровневые с вложенными children).
 * Категории меняются редко → кэшируем на час.
 */
export async function getCategoryTree(): Promise<Category[]> {
  const data = await unwrap(
    apiServer.GET("/api/v1/categories", { next: { revalidate: 3600 } }),
  );
  return data.map(toCategory);
}

/** Верхнеуровневые категории (корни дерева) — для чипов навигации и грида на главной. */
export async function getTopCategories(): Promise<Category[]> {
  const tree = await getCategoryTree();
  return tree; // бэкенд возвращает именно корни верхним уровнем
}

/**
 * Категория по id (cuid) — ищет в дереве (товары хранят categoryId, не slug).
 * Нужно для хлебных крошек на карточке товара. null, если не найдена.
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const tree = await getCategoryTree();
  const stack = [...tree];
  while (stack.length) {
    const node = stack.pop()!;
    if (node.id === id) return node;
    stack.push(...node.children);
  }
  return null;
}

/**
 * Категория по slug + её прямые дети. Возвращает null при 404.
 * (Дети здесь на один уровень — detail-форма бэкенда.)
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const dto = await unwrap(
      apiServer.GET("/api/v1/categories/{slug}", {
        params: { path: { slug } },
        next: { revalidate: 3600 },
      }),
    );
    return detailToCategory(dto);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Маппит detail-форму (дети на один уровень, без рекурсии). */
function detailToCategory(dto: CategoryDetailDto): Category {
  return {
    id: dto.id,
    parentId: dto.parentId,
    slug: dto.slug,
    name: dto.name,
    sortOrder: dto.sortOrder,
    children: dto.children.map((c) => ({ ...c, children: [] })),
  };
}
