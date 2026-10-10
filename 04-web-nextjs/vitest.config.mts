import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // серверные модули (apiServer/serverEnv) парсят env при импорте — задаём валидные URL
    env: {
      API_INTERNAL_URL: "http://localhost:3001",
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3001",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(dir, "src"),
      // "server-only" кидает вне RSC — подменяем пустым модулем в тестах
      "server-only": path.resolve(dir, "test-stubs/server-only.ts"),
    },
  },
});
