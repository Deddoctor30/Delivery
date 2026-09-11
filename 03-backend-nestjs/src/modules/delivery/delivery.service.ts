import { Injectable } from '@nestjs/common';

interface Point {
  lat: number;
  lng: number;
}

export interface DeliveryEstimate {
  distanceKm: number;
  estimatedDays: number;
  deliveryAmount: number; // в копейках
}

// склад/точка отправки — Москва
const ORIGIN: Point = { lat: 55.7558, lng: 37.6173 };
// Москва — Владивосток по прямой ~6400 км: верхняя граница шкалы
const MAX_KM = 6400;
const MIN_DAYS = 2;
const MAX_DAYS = 14;

// стоимость доставки: базовая + за километр (копейки)
const BASE_FEE = 30_000; // 300 ₽ базовый тариф
const FEE_PER_KM = 500; //  5 ₽ за км по прямой

@Injectable()
export class DeliveryService {
  estimate(lat: number, lng: number): DeliveryEstimate {
    const distanceKm = this.haversine(ORIGIN, { lat, lng });

    // линейная интерполяция срока: чем дальше, тем дольше, но в рамках [2, 14] дней
    const rawDays = MIN_DAYS + (distanceKm / MAX_KM) * (MAX_DAYS - MIN_DAYS);
    const estimatedDays = this.clamp(Math.round(rawDays), MIN_DAYS, MAX_DAYS);

    const deliveryAmount = BASE_FEE + Math.round(distanceKm) * FEE_PER_KM;

    return {
      distanceKm: Math.round(distanceKm),
      estimatedDays,
      deliveryAmount,
    };
  }

  // расстояние по большому кругу между двумя точками (км)
  private haversine(a: Point, b: Point): number {
    const R = 6371; // радиус Земли, км
    const dLat = this.toRad(b.lat - a.lat);
    const dLng = this.toRad(b.lng - a.lng);
    const lat1 = this.toRad(a.lat);
    const lat2 = this.toRad(b.lat);

    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
