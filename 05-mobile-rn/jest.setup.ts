// EXPO_PUBLIC_* инлайнятся babel-preset-expo из окружения. Задаём для тестов,
// чтобы модули, читающие env.apiUrl, не падали на zod fail-fast при импорте.
process.env.EXPO_PUBLIC_API_URL = "http://localhost:3001";

// AsyncStorage (persist гостевой корзины) → официальный jest-мок, без нативного модуля.
jest.mock("@react-native-async-storage/async-storage", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- мок-фабрика jest требует require
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// lucide-react-native поставляется как .mjs (дефолтный transform jest-expo .mjs не берёт).
// В тестах иконки не нужны — любой импорт отдаём заглушкой-компонентом.
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));
