"use server";

import { revalidatePath } from "next/cache";

import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap, ApiError } from "@/shared/api/error";

export type FavoriteActionResult = { ok: true; ids: string[] } | { ok: false; error: string };

function fail(e: unknown): FavoriteActionResult {
  const error = e instanceof ApiError ? e.message : "Не удалось обновить избранное";
  return { ok: false, error };
}

/** Добавить товар в избранное. Возвращает актуальный набор id. */
export async function addFavoriteAction(productId: string): Promise<FavoriteActionResult> {
  try {
    const { ids } = await unwrap(
      apiServerAuth.POST("/api/v1/favorites/{productId}", { params: { path: { productId } } }),
    );
    revalidatePath("/account");
    return { ok: true, ids };
  } catch (e) {
    return fail(e);
  }
}

/** Убрать товар из избранного. Возвращает актуальный набор id. */
export async function removeFavoriteAction(productId: string): Promise<FavoriteActionResult> {
  try {
    const { ids } = await unwrap(
      apiServerAuth.DELETE("/api/v1/favorites/{productId}", { params: { path: { productId } } }),
    );
    revalidatePath("/account");
    return { ok: true, ids };
  } catch (e) {
    return fail(e);
  }
}
