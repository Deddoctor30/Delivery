"use server";

import { revalidatePath } from "next/cache";

import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap, ApiError } from "@/shared/api/error";

export type CreateOrderInput = {
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
};

export type CreateOrderResult = { ok: true; orderId: string } | { ok: false; error: string };

/**
 * Создать заказ из серверной корзины пользователя.
 * Бэкенд сам берёт позиции из cart, считает доставку и очищает корзину.
 */
export async function createOrderAction(input: CreateOrderInput): Promise<CreateOrderResult> {
  try {
    const order = await unwrap(apiServerAuth.POST("/api/v1/orders", { body: input }));
    revalidatePath("/orders");
    revalidatePath("/cart");
    return { ok: true, orderId: order.id };
  } catch (e) {
    const error = e instanceof ApiError ? e.message : "Не удалось оформить заказ";
    return { ok: false, error };
  }
}
