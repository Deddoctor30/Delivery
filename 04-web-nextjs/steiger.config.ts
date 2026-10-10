import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  // Тест-файлы живут рядом с кодом, но не являются частью FSD-структуры.
  { ignores: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"] },

  ...fsd.configs.recommended,

  // insignificant-slice считает только межслойные ссылки между срезами и не учитывает
  // импорт из роутинга (app) и страниц (views). В App-Router-проекте фичи/сущности
  // сплошь потребляются напрямую из app/views → правило даёт постоянные ложные
  // «no references»/«only one reference». Выключаем (оно advisory).
  {
    files: ["./src/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },

  // src/app — роутинг Next App Router (route/layout/page/providers), не FSD-слой
  // с сегментами. Отключаем неприменимые правила, но НЕ исключаем из анализа —
  // иначе steiger не увидит импорты из app и решит, что слои «без ссылок».
  // Направление импортов стережёт eslint-plugin-boundaries.
  {
    files: ["./src/app/**"],
    rules: {
      "fsd/public-api": "off",
      "fsd/no-public-api-sidestep": "off",
      "fsd/segments-by-purpose": "off",
      "fsd/insignificant-slice": "off",
    },
  },

  // shared экспонирует НЕСКОЛЬКО точек входа по сегментам
  // (shared/ui, shared/api/server, shared/api/error, shared/config/env, ...),
  // а из-за server/client-разделения Next импортируем конкретные файлы напрямую —
  // единый public API сегмента тут неприменим.
  {
    files: ["./src/shared/**"],
    rules: {
      "fsd/public-api": "off",
      "fsd/no-public-api-sidestep": "off",
    },
  },

  // features: server-only мост (features/auth/api/bridge) нельзя класть в
  // клиентский public API фичи — его импортируют напрямую серверные роуты.
  {
    files: ["./src/features/**"],
    rules: {
      "fsd/no-public-api-sidestep": "off",
    },
  },
]);
