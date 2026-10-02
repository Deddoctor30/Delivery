import "server-only";

import { cookies } from "next/headers";

import type { User } from "@/entities/user";
import { ApiError } from "@/shared/api/error";
import { serverEnv } from "@/shared/config/env";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
export const SESSION_COOKIE = "session_id";

const REFRESH_PATH = "/api/auth/refresh";
const isProd = process.env.NODE_ENV === "production";
const baseCookie = { httpOnly: true, secure: isProd, sameSite: "strict" as const };

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
};

export type AuthResult = TokenPair & { user: User };

export async function backendLogin(body: { email: string; password: string }): Promise<AuthResult> {
  const res = await fetch(`${serverEnv.API_INTERNAL_URL}/api/v1/auth/login-or-register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
    throw new ApiError(res.status, err.code ?? "AUTH_FAILED", err.message ?? "Ошибка входа");
  }
  return res.json() as Promise<AuthResult>;
}

export async function setAuthCookies(t: TokenPair): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, t.accessToken, { ...baseCookie, path: "/", maxAge: 60 * 30 });
  jar.set(REFRESH_COOKIE, t.refreshToken, {
    ...baseCookie,
    path: REFRESH_PATH,
    maxAge: 60 * 60 * 24 * 7,
  });
  jar.set(SESSION_COOKIE, t.sessionId, {
    ...baseCookie,
    path: REFRESH_PATH,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete({ name: REFRESH_COOKIE, path: REFRESH_PATH });
  jar.delete({ name: SESSION_COOKIE, path: REFRESH_PATH });
}

export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value ?? null;
}

export async function backendMe(accessToken: string): Promise<User | null> {
  const res = await fetch(`${serverEnv.API_INTERNAL_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new ApiError(res.status, "ME_FAILED", "Не удалось получить профиль");
  return res.json() as Promise<User>;
}

/** Read-only: для RSC/layout. Куки не ротирует. */
export async function getCurrentUser(): Promise<User | null> {
  const token = await getAccessToken();
  if (!token) return null;
  return backendMe(token);
}

async function backendRefresh(input: TokenPair | { refreshToken: string; sessionId: string }) {
  const res = await fetch(`${serverEnv.API_INTERNAL_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: input.refreshToken, sessionId: input.sessionId }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<TokenPair>;
}

/** Для refresh-роута: читает refresh/session куки, ротирует, переставляет куки. */
export async function refreshAuth(): Promise<TokenPair | null> {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (!refreshToken || !sessionId) return null;

  const pair = await backendRefresh({ refreshToken, sessionId });
  if (!pair) {
    await clearAuthCookies();
    return null;
  }
  await setAuthCookies(pair);
  return pair;
}

export async function backendLogout(accessToken: string): Promise<void> {
  await fetch(`${serverEnv.API_INTERNAL_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  }).catch(() => undefined);
}
