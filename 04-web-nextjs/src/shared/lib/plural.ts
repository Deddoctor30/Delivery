/**
 * Русское склонение слова по числу.
 *
 * @example plural(1, ["товар", "товара", "товаров"]) → "товар"
 * @example plural(3, ["день", "дня", "дней"]) → "дня"
 */
export function plural(n: number, forms: [one: string, few: string, many: string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
