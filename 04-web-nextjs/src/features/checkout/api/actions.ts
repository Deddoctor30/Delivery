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

export type GeoAddress = { city?: string; street?: string; zip?: string; display?: string };
export type ReverseGeocodeResult = { ok: true; address: GeoAddress } | { ok: false; error: string };

type NominatimAddress = {
  road?: string;
  house_number?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
};

/**
 * Обратное геокодирование точки → адрес (OSM Nominatim, без API-ключа).
 *
 * Серверный экшен: даёт корректный User-Agent (политика Nominatim требует
 * идентификации и не более ~1 запроса/сек) и обходит CORS. Для продакшена
 * с нагрузкой нужен свой геокодер/кэш — для MVP достаточно публичного Nominatim.
 */
export async function reverseGeocodeAction(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ru`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Delivery/1.0 (demo marketplace app)" },
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: "Не удалось определить адрес" };

    const data = (await res.json()) as { address?: NominatimAddress; display_name?: string };
    const a = data.address ?? {};
    const city = a.city || a.town || a.village || a.municipality || a.county || a.state;
    const street = a.road
      ? `${a.road}${a.house_number ? `, д. ${a.house_number}` : ""}`
      : undefined;

    return { ok: true, address: { city, street, zip: a.postcode, display: data.display_name } };
  } catch {
    return { ok: false, error: "Не удалось определить адрес" };
  }
}
