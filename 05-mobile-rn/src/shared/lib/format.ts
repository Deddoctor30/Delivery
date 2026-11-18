/** 1234567 → "1 234 567 ₽" (без Intl — надёжно в Hermes). */
export function formatPrice(value: number): string {
  return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₽`;
}
