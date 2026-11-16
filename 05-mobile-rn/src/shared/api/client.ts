import createClient, { type Middleware } from "openapi-fetch";

import { env } from "@/shared/config/env";

import { refreshTokens, notifySessionExpired } from "./auth-fetch";
import { clearTokens, getAccessToken } from "./token-store";
import type { paths } from "./schema";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const access = await getAccessToken();
    if (access) request.headers.set("Authorization", `Bearer ${access}`);
    return request;
  },
  async onResponse({ request, response }) {
    if (response.status !== 401 || request.url.includes("/auth/refresh")) return response;
    const newAccess = await refreshTokens();
    if (!newAccess) {
      await clearTokens();
      notifySessionExpired();
      return response;
    }
    try {
      const retried = request.clone();
      retried.headers.set("Authorization", `Bearer ${newAccess}`);
      return await fetch(retried);
    } catch {
      // тело уже израсходовано (мутация с body) — вернём 401, но токены уже обновлены
      return response;
    }
  },
};

export const api = createClient<paths>({ baseUrl: env.apiUrl });
api.use(authMiddleware);
