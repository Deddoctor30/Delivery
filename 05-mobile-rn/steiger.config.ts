import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  // Тест-файлы живут рядом с кодом, но не часть FSD-структуры.
  { ignores: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"] },

  ...fsd.configs.recommended,

  // Роутинг Expo Router лежит в корневой app/ (вне ./src). Поэтому фичи/сущности,
  // которые потребляются только из app, steiger видит как «без ссылок» → глушим
  // advisory-правило (направление импортов стережёт eslint-plugin-boundaries).
  {
    files: ["./src/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },

  // shared экспонирует несколько точек входа по сегментам (ui/api/config/lib/model) —
  // единый public API сегмента тут неприменим.
  {
    files: ["./src/shared/**"],
    rules: {
      "fsd/public-api": "off",
      "fsd/no-public-api-sidestep": "off",
    },
  },
]);
