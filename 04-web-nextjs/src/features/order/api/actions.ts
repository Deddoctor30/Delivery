"use server";

import { revalidatePath } from "next/cache";

import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap, ApiError } from "@/shared/api/error";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Отменить заказ (владелец, статусы created/processing). */
export async function cancelOrderAction(id: string): Promise<ActionResult> {
  try {
    await unwrap(
      apiServerAuth.POST("/api/v1/orders/{id}/cancel", { params: { path: { id } } }),
    );
    revalidatePath(`/orders/${id}`);
    revalidatePath("/orders");
    return { ok: true };
  } catch (e) {
    const error = e instanceof ApiError ? e.message : "Не удалось отменить заказ";
    return { ok: false, error };
  }
}
