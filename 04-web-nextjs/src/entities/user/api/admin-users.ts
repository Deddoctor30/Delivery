import "server-only";

import { apiServerAuth } from "@/shared/api/client-auth";
import { unwrap, ApiError } from "@/shared/api/error";
import type { components } from "@/shared/api/schema";

import type { User } from "../model/types";

type UserDto = components["schemas"]["UserDto"];

/** Маппит DTO бэкенда в доменного User (формы совпадают). */
export function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    phone: dto.phone,
    avatarId: dto.avatarId,
    role: dto.role,
    createdAt: dto.createdAt,
  };
}

/** Список пользователей (админ): поиск + пагинация. Приватно, только ADMIN. */
export async function getAdminUsers(
  params: { search?: string; page?: number; limit?: number } = {},
): Promise<{ items: User[]; total: number; page: number; limit: number; totalPages: number }> {
  const { search, page = 1, limit = 20 } = params;
  const data = await unwrap(
    apiServerAuth.GET("/api/v1/admin/users", {
      params: { query: { ...(search ? { search } : {}), page, limit } },
      cache: "no-store",
    }),
  );
  return {
    items: data.items.map(toUser),
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  };
}

/** Один пользователь по id (админ). null при 404. */
export async function getAdminUser(id: string): Promise<User | null> {
  try {
    const dto = await unwrap(
      apiServerAuth.GET("/api/v1/admin/users/{id}", {
        params: { path: { id } },
        cache: "no-store",
      }),
    );
    return toUser(dto);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
