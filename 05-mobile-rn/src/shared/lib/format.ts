/** 1234567 → "1 234 567 ₽" (без Intl — надёжно в Hermes). */
export function formatPrice(value: number): string {
  return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₽`;
}

const MONTHS_LONG = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];
const MONTHS_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

/** «5 ноября 2026» */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()] ?? ""} ${d.getFullYear()}`;
}

/** «5 ноя, 14:30» — для таймлайна статусов */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()] ?? ""}, ${hh}:${mm}`;
}
