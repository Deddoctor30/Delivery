/// <reference types="nativewind/types" />

// Декларация для side-effect импорта `global.css` (NativeWind). В норме её даёт
// `expo/types` через сгенерированный `expo-env.d.ts`, но он gitignored и в CI
// отсутствует → дублируем здесь (shorthand-дубль с expo не конфликтует). Без неё
// `tsc` в CI падает с TS2882 на `import "../../global.css"`.
declare module "*.css";
