"use server";

import { revalidatePath } from "next/cache";

import { apiServerAuth } from "@/shared/api/client-auth";
import { ApiError, unwrap } from "@/shared/api/error";
import { apiServer } from "@/shared/api/server";

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

export type DeliveryEstimate = {
  /** Стоимость доставки в РУБЛЯХ (бэк отдаёт копейки). */
  cost: number;
  /** Срок в днях. */
  days: number;
  distanceKm: number;
};

export type EstimateResult =
  { ok: true; estimate: DeliveryEstimate } | { ok: false; error: string };

/** Рассчитать стоимость/срок доставки по координатам точки. */
export async function estimateDeliveryAction(lat: number, lng: number): Promise<EstimateResult> {
  try {
    const dto = await unwrap(apiServer.POST("/api/v1/delivery/estimate", { body: { lat, lng } }));
    return {
      ok: true,
      estimate: {
        cost: Math.round(dto.deliveryAmount / 100),
        days: dto.estimatedDays,
        distanceKm: dto.distanceKm,
      },
    };
  } catch (e) {
    const error = e instanceof ApiError ? e.message : "Не удалось рассчитать доставку";
    return { ok: false, error };
  }
}
