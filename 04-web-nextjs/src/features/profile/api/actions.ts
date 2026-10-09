"use server";

import { revalidatePath } from "next/cache";

import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap, ApiError } from "@/shared/api/error";
import type { User } from "@/entities/user";

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type ProfileActionResult = { ok: true; user: User } | { ok: false; error: string };

/** Обновить профиль текущего пользователя (PATCH /users/me). */
export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<ProfileActionResult> {
  try {
    const user = await unwrap(apiServerAuth.PATCH("/api/v1/users/me", { body: input }));
    revalidatePath("/account");
    return { ok: true, user };
  } catch (e) {
    return { ok: false, error: toErrorMessage(e) };
  }
}

export type ChangePasswordInput = { currentPassword: string; newPassword: string };
export type ChangePasswordResult = { ok: true } | { ok: false; error: string };

/** Сменить пароль текущего пользователя (PATCH /auth/password). */
export async function changePasswordAction(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  try {
    await unwrap(apiServerAuth.PATCH("/api/v1/auth/password", { body: input }));
    return { ok: true };
  } catch (e) {
    const error = e instanceof ApiError ? e.message : "Не удалось сменить пароль";
    return { ok: false, error };
  }
}

/** Понятный текст ошибки: для VALIDATION_ERROR достаём детали валидации. */
function toErrorMessage(e: unknown): string {
  if (!(e instanceof ApiError)) return "Не удалось сохранить профиль";
  if (e.code === "PHONE_TAKEN") return "Этот телефон уже используется";
  const details = e.details;
  if (
    e.code === "VALIDATION_ERROR" &&
    details &&
    typeof details === "object" &&
    "validation" in details &&
    Array.isArray((details as { validation: unknown }).validation)
  ) {
    const msgs = (details as { validation: unknown[] }).validation.filter(
      (m): m is string => typeof m === "string",
    );
    if (msgs.length) return msgs.join(". ");
  }
  return e.message;
}
