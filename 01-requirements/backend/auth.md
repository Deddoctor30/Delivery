# Паттерн аутентификации: JWT + Redis (отзыв и ротация) + мост в Next + Bearer (мобилка)

Спецификация для системы с одним ресурсным API (NestJS), хранилищем состояния
(Redis) и двумя клиентами (Next.js web, React Native). Токены выпускает и
проверяет сам Nest (собственный логин по паролю, без внешнего IdP). Формулировки
нормативные: MUST — обязательно, SHOULD — рекомендуется, MUST NOT — запрещено.

## 1. Суть схемы

- **Access** — короткоживущий подписанный JWT. Nest валидирует его подписью и сроком,
  затем проверяет denylist в Redis (для отзыва). Бо́льшая часть проверки локальна,
  Redis — один дешёвый lookup.
- **Refresh** — opaque-токен (не JWT). Nest хранит в Redis только его ХЕШ, ротирует
  при каждом использовании и детектирует повторное использование (reuse detection).
- **Redis** держит состояние отзыва и сессий — на стороне Nest. **Next ничего не хранит.**
- Nest принимает авторизацию ТОЛЬКО через `Authorization: Bearer` — одна схема для
  всех клиентов; про куки Nest не знает.
- Веб: Next — stateless cookie↔header мост. Мобилка: secure storage + Bearer напрямую.

## 2. Модель токенов

- **Access**: signed JWT (RFC 7519), SHOULD 30 минут, несёт `jti` (id токена) и `iat`.
- **Refresh**: высокоэнтропийная случайная строка (7 дней), долгоживущий, используется только
  для получения нового access.
- JWT **подписывается, а не шифруется**: payload — base64, читаемый любым, кто получит
  токен. MUST NOT класть секреты в payload. Безопасность — подпись (подделать нельзя)
  + HTTPS + хранение вне досягаемости JS.
- Порядок валидации access на Nest:
  1. проверить подпись секретом — иначе reject;
  2. проверить `exp` — иначе reject;
  3. проверить denylist по `jti` в Redis — если ключ есть, reject;
  4. (опционально) проверить `iat` ≥ `validAfter` пользователя — для «выйти везде».
  Шаги 1–2 локальные; Redis трогается только в 3 (и 4).

## 3. Транспорт к ресурсному API (единый для всех клиентов)

- Токен MUST передаваться в `Authorization: Bearer <jwt>` (RFC 6750).
- MUST NOT: токен в query-параметре или в теле запроса как способ авторизации.
- Nest MUST оставаться client-agnostic и cookie-agnostic.

## 4. Состояние в Redis (на стороне Nest)

- `denylist:<jti>` → метка; TTL = остаток жизни access-токена. Наличие ключа = отозван.
- `refresh:<sessionId>` → хеш текущего refresh + `userId` + метаданные (устройство,
  выдан когда); TTL = срок жизни refresh. `sessionId` — идентификатор сессии/устройства,
  один на логин.
- (опционально) `user:<userId>:validAfter` → метка времени для «выйти на всех устройствах».
- MUST: в Redis хранится только ХЕШ refresh-токена (дамп Redis не должен давать рабочие токены).
- На всех ключах MUST стоять TTL — наборы самоочищаются, память ограничена сама собой.
- Persistence: SHOULD включить (AOF) для `refresh:*`, иначе рестарт Redis разлогинит всех
  и временно сломает reuse-detection. Для `denylist:*` persistence некритична (потеря лишь
  вернёт к жизни уже почти истёкшие access-токены).

## 5. Протухание, отзыв и ротация refresh

- **Протухание**: и access (`exp`), и refresh (TTL в Redis) имеют срок; истёкшие отклоняются.
- **Отзыв одной сессии (logout)**: MUST добавить `jti` текущего access в denylist
  (TTL = остаток жизни) И удалить `refresh:<sessionId>`. Access умирает сразу, выпустить
  новый нечем.
- **Выйти на всех устройствах / смена пароля / бан**: MUST поднять `validAfter`
  пользователя в `now` И удалить все его `refresh:*`.
- **Ротация refresh**: при каждом refresh Nest MUST выдать НОВЫЙ access и НОВЫЙ refresh
  и инвалидировать старый (перезаписать хеш в `refresh:<sessionId>`).
- **Reuse-detection**: если предъявлен refresh, не совпадающий с текущим для существующей
  сессии (т.е. уже ротированный или украденный), MUST трактовать это как компрометацию:
  удалить всю `refresh:<sessionId>` (вся сессия гибнет) и потребовать релогин.

## 6. Веб-клиент (Next.js) — stateless cookie↔header мост

Next не хранит токены и не ведёт сессий — он только перекладывает токен между кукой
(сторона браузера) и заголовком (сторона Nest), в обе стороны.

- **Логин / refresh (Nest → кука)**: Next проксирует на Nest, кладёт выданные токены в
  HttpOnly-куки (access — отдельной кукой; refresh — кукой с `Path`, ограниченным
  refresh-роутом) и НЕ сохраняет их у себя; тело с токеном браузеру не отдаётся.
- **Обычный запрос (кука → заголовок)**: Next читает access-куку, ставит
  `Authorization: Bearer <access>` и проксирует на Nest.
- **Refresh**: при `401` Next-роут шлёт refresh-куку на refresh-эндпоинт Nest; Nest
  ротирует (см. §5) и возвращает новые токены; Next переставляет куки.

Свойства:
- Токен живёт в HttpOnly-куке (JS не читает → защита от XSS-кражи); Next его не хранит.
- Кука существует только на отрезке браузер ↔ Next (оба same-origin). На хопе Next → Nest
  куки нет — Next явно ставит заголовок. Поэтому **same-site между Nest и вебом НЕ требуется**.
- Браузер ходит только в Next (same-origin) → **CORS для веба не нужен**; мобилка не браузер
  → CORS к ней неприменим.

Роль браузерного JS:
- MUST NOT: читать токены, ставить `Authorization`, делать refresh вручную с токеном.
- Делает: инициирует login/logout, ходит на route handlers Next, реагирует на 401/403.

## 7. Мобильный клиент (React Native)

- access и refresh MUST храниться в защищённом хранилище устройства (Keychain iOS /
  Keystore Android, напр. `expo-secure-store`). MUST NOT: AsyncStorage / незащищённое хранилище.
- Запросы идут напрямую в Nest с `Authorization: Bearer <access>`; refresh — прямой вызов
  refresh-эндпоинта Nest. Reuse-detection и ротация работают так же (§5).
- Мост/прокси не используется; мобилка развязана с веб-кукой.

## 8. Атрибуты куки (веб, ставит Next)

- MUST: `Secure` (только HTTPS), `HttpOnly` (недоступна из JS).
- SHOULD: `SameSite=Strict`.
- SHOULD: `Path` refresh-куки ограничить refresh-роутом; сроки куки близко к срокам токенов.

## 9. CSRF (только веб / cookie-путь)

- Кука прицепляется браузером автоматически → route handlers Next — мишень CSRF.
- MUST: `SameSite=Strict` как основная защита.
- SHOULD (defense-in-depth): CSRF-токен на мутирующих запросах либо проверка `Origin`/`Referer`.
- Мобильный Bearer-путь CSRF-защиты не требует.

## 10. Запрещено повсеместно

- MUST NOT: хранить токены в `localStorage` / `sessionStorage`.
- MUST NOT: отдавать токен в браузерный JS (в т.ч. в теле ответа логина).
- MUST NOT: класть секреты в payload JWT.
- MUST NOT: хранить refresh в Redis в открытом виде (только хеш).
- MUST NOT: один бессрочный токен без разделения access/refresh.

## 11. Инварианты (чек-лист)

- [ ] access = подписанный JWT с `jti`; валидация = подпись + `exp` + denylist(`jti`).
- [ ] refresh = opaque; в Redis только его хеш; ротация на каждом использовании.
- [ ] reuse-detection: повторный/старый refresh → убить всю сессию и релогин.
- [ ] logout: `jti` в denylist + удалить refresh-сессию. «Выйти везде»: `validAfter` + удалить все refresh.
- [ ] Redis на стороне Nest; Next ничего не хранит (только кука↔заголовок в обе стороны).
- [ ] Redis: TTL на всех ключах; AOF для `refresh:*`; в Redis только хеши refresh.
- [ ] токен в HttpOnly + Secure + SameSite=Strict куке; same-site Nest↔веб не нужен; CORS веба не нужен.
- [ ] CSRF-защита на route handlers Next; мобилка — secure storage + Bearer напрямую.
- [ ] нет токенов в localStorage / sessionStorage / query; нет секретов в payload JWT.

## Стандарты

- RFC 6749 — OAuth 2.0 Authorization Framework (терминология access/refresh)
- RFC 6750 — OAuth 2.0 Bearer Token Usage
- RFC 7519 — JSON Web Token (JWT)
- RFC 9700 — OAuth 2.0 Security Best Current Practice (короткий access, ротация refresh, reuse-detection)
- OWASP Cheat Sheets: JWT, Session Management, CSRF Prevention
