import "server-only";

import createClient, { type Middleware } from "openapi-fetch";
import { cookies } from "next/headers";

import { serverEnv } from "@/shared/config/env";

import type { paths } from "./schema";

/**
 * Имя куки с access-токеном. Дублирует значение из auth-моста
 * (`features/auth/api/bridge.ts`) намеренно: `shared` не может импортировать
 * из `features` (правило слоёв FSD), а имя куки — инфраструктурная константа.
 */
const ACCESS_COOKIE = "access_token";

/**
 * Прикрепляет `Authorization: Bearer <access_token>` из HttpOnly-куки к каждому
 * запросу. Куки читаются на сервере через next/headers — поэтому клиент
 * server-only и используется только в серверном коде (RSC, server actions,
 * route handlers).
 */
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = (await cookies()).get(ACCESS_COOKIE)?.value;
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
};

/**
 * Авторизованный API-клиент для ПРИВАТНЫХ эндпоинтов (cart, orders, users/me,
 * checkout). Ответы персональные → вызывай с `cache: "no-store"`.
 *
 * Публичные эндпоинты (products, categories) — через `apiServer` из `./server`.
 */
export const apiServerAuth = createClient<paths>({
  baseUrl: serverEnv.API_INTERNAL_URL,
});

apiServerAuth.use(authMiddleware);
