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

  // shared экспонирует несколько точек входа по сегментам (ui/api/config/lib).
  {
    files: ["./src/shared/**"],
    rules: {
      "fsd/public-api": "off",
      "fsd/no-public-api-sidestep": "off",
    },
  },

  // features/cart осознанно зависит от сессии (features/auth): серверная/гостевая
  // корзина и мерж при логине завязаны на useSession. На вебе это решалось инъекцией
  // isAuthenticated из app-слоя; на мобилке хуки корзины читают сессию напрямую.
  // Точечно глушим запрет cross-import между слайсами для cart.
  {
    files: ["./src/features/cart/**"],
    rules: {
      "fsd/forbidden-imports": "off",
    },
  },
]);
