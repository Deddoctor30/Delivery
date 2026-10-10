import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e — прогон против РЕАЛЬНОГО докер-стека (postgres+redis+backend+web).
 *
 * Перед запуском подними стек из корня репозитория:
 *   docker compose up -d --build
 * и дождись, пока web ответит на http://localhost:3000.
 *
 * Конфиг НЕ поднимает сервер сам (webServer не задан) — тесты бьют по уже
 * работающему стеку. baseURL — адрес web-контейнера.
 *
 * Спеки лежат в e2e/ (вне src/), поэтому vitest/steiger/boundaries их не трогают.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
