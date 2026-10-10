"use server";

import { revalidatePath } from "next/cache";

import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap, ApiError } from "@/shared/api/error";
import { toAddress } from "@/entities/address/api";
import type { Address } from "@/entities/address";

export type AddressInput = {
  label?: string;
  city: string;
  street: string;
  apt?: string;
  zip?: string;
  comment?: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
};

export type AddressActionResult = { ok: true; addresses: Address[] } | { ok: false; error: string };

function fail(e: unknown): AddressActionResult {
  const error = e instanceof ApiError ? e.message : "Не удалось сохранить адрес";
  return { ok: false, error };
}

function revalidate() {
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

/** Добавить адрес. Возвращает актуальный список. */
export async function createAddressAction(input: AddressInput): Promise<AddressActionResult> {
  try {
    const items = await unwrap(apiServerAuth.POST("/api/v1/addresses", { body: input }));
    revalidate();
    return { ok: true, addresses: items.map(toAddress) };
  } catch (e) {
    return fail(e);
  }
}

/** Изменить адрес. */
export async function updateAddressAction(
  id: string,
  input: Partial<AddressInput>,
): Promise<AddressActionResult> {
  try {
    const items = await unwrap(
      apiServerAuth.PATCH("/api/v1/addresses/{id}", { params: { path: { id } }, body: input }),
    );
    revalidate();
    return { ok: true, addresses: items.map(toAddress) };
  } catch (e) {
    return fail(e);
  }
}

/** Удалить адрес. */
export async function deleteAddressAction(id: string): Promise<AddressActionResult> {
  try {
    const items = await unwrap(
      apiServerAuth.DELETE("/api/v1/addresses/{id}", { params: { path: { id } } }),
    );
    revalidate();
    return { ok: true, addresses: items.map(toAddress) };
  } catch (e) {
    return fail(e);
  }
}

/** Сделать адрес основным. */
export async function setDefaultAddressAction(id: string): Promise<AddressActionResult> {
  try {
    const items = await unwrap(
      apiServerAuth.POST("/api/v1/addresses/{id}/default", { params: { path: { id } } }),
    );
    revalidate();
    return { ok: true, addresses: items.map(toAddress) };
  } catch (e) {
    return fail(e);
  }
}
