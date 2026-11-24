import { api } from "@/shared/api/client";
import { unwrap } from "@/shared/api/error";
import type { components } from "@/shared/api/schema";

import type { User } from "../model/types";

type UserDto = components["schemas"]["UserDto"];

/** DTO бэка → доменный User. */
export function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    phone: dto.phone,
    avatarId: dto.avatarId,
    role: dto.role === "ADMIN" ? "ADMIN" : "CLIENT",
    createdAt: dto.createdAt,
  };
}

export interface UpdateMeInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarId?: "avatar-male" | "avatar-female";
}

/** Обновить свой профиль (PATCH /users/me). */
export async function updateMe(input: UpdateMeInput): Promise<User> {
  const dto = await unwrap(api.PATCH("/api/v1/users/me", { body: input }));
  return toUser(dto);
}
