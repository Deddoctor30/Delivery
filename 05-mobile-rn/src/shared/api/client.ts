import createClient from "openapi-fetch";

import { env } from "@/shared/config/env";

import type { paths } from "./schema";

/**
 * Единый клиент к бэкенду. baseUrl — прямой адрес Nest (env.apiUrl).
 * Авторизацию (Bearer из secure-store + refresh на 401) навесим middleware
 * на Этапе 6 — здесь пока «голый» клиент для публичных чтений.
 */
export const api = createClient<paths>({ baseUrl: env.apiUrl });
