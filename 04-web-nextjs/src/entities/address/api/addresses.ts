import "server-only";

import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap } from "@/shared/api/error";
import type { components } from "@/shared/api/schema";

import type { Address } from "../model/types";

type AddressDto = components["schemas"]["AddressDto"];

/** Маппит DTO бэкенда в доменный Address (отбрасываем userId/createdAt). */
export function toAddress(dto: AddressDto): Address {
  return {
    id: dto.id,
    label: dto.label,
    city: dto.city,
    street: dto.street,
    apt: dto.apt,
    zip: dto.zip,
    comment: dto.comment,
    lat: dto.lat,
    lng: dto.lng,
    isDefault: dto.isDefault,
  };
}

/** Адреса доставки текущего пользователя (приватно, Bearer из куки). */
export async function getAddresses(): Promise<Address[]> {
  const items = await unwrap(apiServerAuth.GET("/api/v1/addresses", { cache: "no-store" }));
  return items.map(toAddress);
}
