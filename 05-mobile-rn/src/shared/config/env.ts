import { treeifyError, z } from "zod";

const schema = z.object({
  EXPO_PUBLIC_API_URL: z.url(),
});

// Прямое обращение к process.env.EXPO_PUBLIC_* — обязательно (статическая замена Expo).
const parsed = schema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});

if (!parsed.success) {
  console.error("❌ Некорректный env:", treeifyError(parsed.error));
  throw new Error("Проверь .env — нужен валидный EXPO_PUBLIC_API_URL");
}

export const env = {
  /** Базовый URL бэкенда без хвостового слэша. */
  apiUrl: parsed.data.EXPO_PUBLIC_API_URL.replace(/\/$/, ""),
};
