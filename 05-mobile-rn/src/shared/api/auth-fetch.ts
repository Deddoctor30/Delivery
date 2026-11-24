import { env } from "@/shared/config/env";

import { clearTokens, getAccessToken, getRefreshData, saveTokens } from "./token-store";

let sessionExpiredHandler: (() => void) | null = null;
/** features/auth регистрирует сюда разлогин (shared не знает про features). */
export function setOnSessionExpired(cb: (() => void) | null): void {
  sessionExpiredHandler = cb;
}
export function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}

/** Прямой вызов /auth/refresh (refreshToken + sessionId в теле). Вернёт новый access или null. */
export async function refreshTokens(): Promise<string | null> {
  const data = await getRefreshData();
  if (!data) return null;
  const res = await fetch(`${env.apiUrl}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  const pair = (await res.json()) as { accessToken: string; refreshToken: string; sessionId: string };
  await saveTokens(pair);
  return pair.accessToken;
}

/** fetch с Bearer и однократным refresh-retry на 401 — для защищённых auth-вызовов (me, logout). */
export async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const access = await getAccessToken();
  const headers = new Headers(init.headers);
  if (access) headers.set("Authorization", `Bearer ${access}`);

  let res = await fetch(`${env.apiUrl}${path}`, { ...init, headers });
  if (res.status === 401) {
    const newAccess = await refreshTokens();
    if (!newAccess) {
      await clearTokens();
      notifySessionExpired();
      return res;
    }
    headers.set("Authorization", `Bearer ${newAccess}`);
    res = await fetch(`${env.apiUrl}${path}`, { ...init, headers });
  }
  return res;
}
