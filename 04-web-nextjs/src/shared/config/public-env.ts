import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url(),
});

export const publicEnv = schema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
