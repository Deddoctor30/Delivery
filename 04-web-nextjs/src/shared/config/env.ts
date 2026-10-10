import "server-only";

import { z } from "zod";

const schema = z.object({
  API_INTERNAL_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const serverEnv = schema.parse({
  API_INTERNAL_URL: process.env.API_INTERNAL_URL,
  NODE_ENV: process.env.NODE_ENV,
});
