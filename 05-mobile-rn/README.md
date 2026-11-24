# Delivery — мобильное приложение (Expo / React Native)

Мобильный клиент маркетплейса Delivery. Тот же бэкенд (`03-backend-nestjs`) и доменная модель, что у веба (`04-web-nextjs`), та же FSD-архитектура — но нативная платформа и свои решения (прямой Bearer-путь авторизации, карта в WebView, гостевая корзина в AsyncStorage).

Правила для AI-агентов и версии — в [AGENTS.md](AGENTS.md). Пошаговый план разработки — [`../01-requirements/mobile/PLAN.md`](../01-requirements/mobile/PLAN.md).

## Стек

- **Expo SDK 58** (React Native 0.88, React 19.3, Hermes), **Expo Router** (file-based, `src/app/`)
- **NativeWind v4** (Tailwind-синтаксис → RN-стили; на движке Tailwind **v3**) + дизайн-токены из брифа (light/dark)
- **TanStack Query** — чтения/кеш/ревалидция/polling; **zustand + persist(AsyncStorage)** — гостевая корзина
- **openapi-fetch** + типы из OpenAPI (`src/shared/api/schema.d.ts`); **zod** — валидация env
- **expo-secure-store** — токены (Keychain/Keystore); **expo-image** — картинки с кешем
- **react-native-webview + Leaflet/OSM** — карта выбора адреса; **lucide-react-native** — иконки
- **jest-expo + @testing-library/react-native** — тесты

## Архитектура

Feature-Sliced Design: `app → views → widgets → features → entities → shared` (импорт только вниз, публичный API через `index.ts`). Границы проверяют `steiger` + `eslint-plugin-boundaries`.

- `src/app/` — тонкие роуты Expo Router (одна строка `export { X as default } from "@/views/*"`), навигаторы в `_layout.tsx`. Таб-бар: `src/app/(tabs)/_layout.tsx`.
- `src/views/*` — сборка экранов; доменная логика и типы — в `entities`/`features`.

## Быстрый старт

```bash
# из корня репозитория сначала поднять бэк:
docker compose up -d                 # проверить http://localhost:3001/api/docs

cd 05-mobile-rn
npm install
cp .env.example .env                  # и вписать адрес бэка (см. ниже)
npx expo start                        # QR для Expo Go
```

Открываешь **Expo Go** на телефоне (Android/iOS) → сканируешь QR. Android Studio/Xcode не нужны. Для Android-эмулятора: `npx expo start --android`.

### ⚠️ Сетевая гоча (критично)

`localhost` на телефоне/эмуляторе — это **само устройство**, не твой ПК. Адрес бэка в `EXPO_PUBLIC_API_URL`:

| Как запускаешь | Адрес бэка |
|---|---|
| Физический телефон (Expo Go) | **LAN-IP ПК**, напр. `http://192.168.1.81:3001` (узнать: `ipconfig`/`ifconfig`); телефон и ПК в одной Wi-Fi |
| Android-эмулятор | `http://10.0.2.2:3001` |

## Переменные окружения

`EXPO_PUBLIC_API_URL` — базовый URL бэка. Префикс `EXPO_PUBLIC_*` **инлайнится в бандл** (аналог `NEXT_PUBLIC_*`), секретов тут нет. Валидируется zod'ом в `src/shared/config/env.ts` (падает на старте при пустом/битом значении). `.env` в gitignore, шаблон — в `.env.example`.

## Авторизация (⚠️ отличие от веба)

Мобилка — не браузер, **cookie-моста нет**. Приложение ходит **напрямую в Nest** с `Authorization: Bearer <access>`:

- токены (access/refresh/sessionId) — **только в `expo-secure-store`** (Keychain/Keystore), НЕ в AsyncStorage;
- refresh на 401 — прямой `POST /auth/refresh`, один повтор в middleware клиента, провал → разлогин;
- **CORS/CSRF не нужны** (нативный клиент). AsyncStorage — только несекретное (тема, гостевая корзина, флаг cookie-баннера).

Нормативно — [`../01-requirements/backend/auth.md`](../01-requirements/backend/auth.md) §7.

## Карты

Выбор адреса — **Leaflet в WebView** (`src/shared/ui/map-picker.tsx`): OSM-тайлы, мост координат через `postMessage`, обратный геокодинг через публичный Nominatim. Без API-ключа и без нативного модуля — работает в Expo Go. `react-native-maps` осознанно не тянем.

## Скрипты

```bash
npm start            # expo start (QR)
npm run android      # expo start --android (эмулятор)
npm run lint         # ESLint
npm run arch         # steiger (границы FSD)
npm run typecheck    # tsc --noEmit
npm test             # unit (jest-expo)
npm run gen:api      # перегенерировать src/shared/api/schema.d.ts из OpenAPI бэка
```

## Тесты

Unit — **jest-expo** + **@testing-library/react-native** (не vitest/jsdom, как на вебе). Покрыто: форматтеры (цена/даты), карты статусов заказа, стор корзины (add/sum/remove/clear), `StatusTimeline` и `Counter` (рендер). Тесты co-located (`*.test.ts(x)`), `steiger` их игнорит.

Гочи (если что-то отвалится):
- jest-expo в RN 0.88 требует peer `@react-native/jest-preset`;
- `@types/jest` подключён через `tsconfig` `"types": ["jest","node"]`;
- **`render` из RNTL v14 асинхронный** — вызывать `await render(...)`;
- `lucide-react-native` (`.mjs`) и AsyncStorage мокаются в `jest.setup.ts`.

E2E (Maestro) — отложено (гонять логичнее на EAS-билде, а не в Expo Go).

## Сборка (EAS Build)

Устанавливаемый Android-билд без локального Android Studio — в облаке Expo. Профили — в [`eas.json`](eas.json) (`preview` = APK, `production` = AAB).

```bash
npm i -g eas-cli            # или npx eas-cli@latest
eas login
eas init                    # создаст проект, впишет extra.eas.projectId в app.json
eas build -p android --profile preview    # облачный APK → ссылка по готовности
```

⚠️ `EXPO_PUBLIC_API_URL` **запекается в билд** (значение из `env` профиля в `eas.json`). Для `preview` стоит LAN-IP — APK ходит на бэк только в той же Wi-Fi. Чтобы раздать билд вовне, нужен публичный бэк (деплой/туннель) и его URL в профиле.

## Что отложено (и почему)

- **E2E (Maestro)** — после стабильного EAS-билда, не в Expo Go.
- **FlashList** на длинных списках — нужен dev-build (нативный модуль); сейчас оптимизированный `FlatList`. Свап — drop-in на dev-build.
- **iOS-сборка/публикация** — требует macOS/Apple Developer; iOS тестируем через Expo Go на устройстве.
- **Push-уведомления, реальная оплата, прод-бэкенд** — вне MVP (статусы заказа — polling'ом).

> **Инвариант:** токены только в `expo-secure-store`, Bearer напрямую в Nest. Никогда в AsyncStorage/незащищённом хранилище.
