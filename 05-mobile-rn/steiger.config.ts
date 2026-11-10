import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  { ignores: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"] },

  ...fsd.configs.recommended,

  // Фичи/сущности потребляются напрямую из app/views → глушим advisory «no references».
  {
    files: ["./src/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },

  // src/app — роутинг Expo Router (не FSD-слой с сегментами). Не исключаем из анализа,
  // но отключаем неприменимые правила public API.
  {
    files: ["./src/app/**"],
    rules: {
      "fsd/public-api": "off",
      "fsd/no-public-api-sidestep": "off",
      "fsd/segments-by-purpose": "off",
      "fsd/insignificant-slice": "off",
    },
  },

  // shared экспонирует несколько точек входа по сегментам (ui/api/config/lib/model).
  {
    files: ["./src/shared/**"],
    rules: {
      "fsd/public-api": "off",
      "fsd/no-public-api-sidestep": "off",
    },
  },
]);
