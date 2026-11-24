import { api } from "@/shared/api/client";
import { unwrap } from "@/shared/api/error";

// ─── Расчёт доставки ─────────────────────────────────────────────────────────

export interface DeliveryEstimate {
  /** Стоимость в РУБЛЯХ (бэк отдаёт копейки). */
  cost: number;
  /** Срок в днях. */
  days: number;
  distanceKm: number;
}

/**
 * Рассчитать стоимость/срок доставки по координатам точки.
 * Эндпоинт @Public — работает и для гостя. null при ошибке (живой расчёт не критичен).
 */
export async function estimateDelivery(lat: number, lng: number): Promise<DeliveryEstimate | null> {
  try {
    const dto = await unwrap(api.POST("/api/v1/delivery/estimate", { body: { lat, lng } }));
    return {
      cost: Math.round(dto.deliveryAmount / 100),
      days: dto.estimatedDays,
      distanceKm: dto.distanceKm,
    };
  } catch {
    return null;
  }
}

// ─── Обратный геокодинг (OSM Nominatim, без ключа) ────────────────────────────

export interface GeoAddress {
  city?: string;
  street?: string;
  zip?: string;
  display?: string;
}

interface NominatimAddress {
  road?: string;
  house_number?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
}

/**
 * Точка → адрес через публичный Nominatim. null при ошибке.
 * ⚠️ Политика Nominatim: валидный User-Agent и ≤1 запрос/сек. Для MVP ок;
 * в проде — свой геокодер/кэш. Вызываем с дебаунсом из экрана.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoAddress | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ru`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Delivery/1.0 (demo marketplace app)" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { address?: NominatimAddress; display_name?: string };
    const a = data.address ?? {};
    const city = a.city || a.town || a.village || a.municipality || a.county || a.state;
    const street = a.road
      ? `${a.road}${a.house_number ? `, д. ${a.house_number}` : ""}`
      : undefined;

    return { city, street, zip: a.postcode, display: data.display_name };
  } catch {
    return null;
  }
}

// ─── Создание заказа ──────────────────────────────────────────────────────────

export interface CreateOrderInput {
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
}

/**
 * Создать заказ из СЕРВЕРНОЙ корзины пользователя (Bearer).
 * Бэк сам берёт позиции из cart, считает доставку и очищает корзину.
 * Возвращает id заказа. Бросает ApiError — ловим в экране.
 */
export async function createOrder(input: CreateOrderInput): Promise<string> {
  const order = await unwrap(api.POST("/api/v1/orders", { body: input }));
  return order.id;
}
