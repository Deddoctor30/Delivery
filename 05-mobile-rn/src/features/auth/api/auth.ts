import type { User, UserRole } from "@/entities/user";
import { authedFetch } from "@/shared/api/auth-fetch";
import { ApiError } from "@/shared/api/error";
import { clearTokens, saveTokens } from "@/shared/api/token-store";
import { env } from "@/shared/config/env";

import type { AuthMode } from "../lib/auth-error";

type UserDto = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarId: string | null;
  role: string;
  createdAt: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user: UserDto;
};

function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.firstName ?? null,
    lastName: dto.lastName ?? null,
    phone: dto.phone ?? null,
    avatarId: dto.avatarId ?? null,
    role: (dto.role === "ADMIN" ? "ADMIN" : "CLIENT") as UserRole,
    createdAt: dto.createdAt,
  };
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(
      res.status,
      (body.code as string) ?? "UNKNOWN",
      (body.message as string) ?? res.statusText,
      body.details,
    );
  }
  return body as T;
}

export async function loginOrRegister(
  email: string,
  password: string,
  mode: AuthMode,
): Promise<User> {
  const res = await fetch(`${env.apiUrl}/api/v1/auth/login-or-register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, mode }),
  });
  const data = await parseOrThrow<LoginResponse>(res);
  await saveTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    sessionId: data.sessionId,
  });
  return toUser(data.user);
}

export async function fetchMe(): Promise<User> {
  const res = await authedFetch("/api/v1/auth/me");
  const data = await parseOrThrow<UserDto>(res);
  return toUser(data);
}

export async function logout(): Promise<void> {
  try {
    await authedFetch("/api/v1/auth/logout", { method: "POST" });
  } catch {
    // даже если бэк не ответил — локально разлогиниваемся
  }
  await clearTokens();
}
