import "server-only";

import createClient from "openapi-fetch";

import { serverEnv } from "@/shared/config/env";

import type { paths } from "./schema";

export const apiServer = createClient<paths>({
  baseUrl: serverEnv.API_INTERNAL_URL,
});
