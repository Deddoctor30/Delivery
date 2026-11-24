import { formatDate, formatDateTime, formatPrice } from "./format";

describe("formatPrice", () => {
  it("разделяет тысячи пробелом и добавляет ₽", () => {
    expect(formatPrice(1990)).toBe("1 990 ₽");
    expect(formatPrice(1234567)).toBe("1 234 567 ₽");
  });
  it("без разделителя для чисел < 1000", () => {
    expect(formatPrice(500)).toBe("500 ₽");
    expect(formatPrice(0)).toBe("0 ₽");
  });
});

describe("formatDate", () => {
  it("отдаёт «<день> <месяц> <год>»", () => {
    expect(formatDate("2026-11-05T12:00:00.000Z")).toMatch(/ноября 2026$/);
  });
});

describe("formatDateTime", () => {
  it("отдаёт «<день> <мес>, чч:мм»", () => {
    expect(formatDateTime("2026-11-05T12:00:00.000Z")).toMatch(/^\d{1,2} [а-яё]{3}, \d{2}:\d{2}$/i);
  });
});
