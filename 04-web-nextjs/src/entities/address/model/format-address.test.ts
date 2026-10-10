import { formatAddress, type Address } from "./types";

const base: Address = {
  id: "a1",
  label: null,
  city: "Москва",
  street: "ул. Ленина, д. 10",
  apt: null,
  zip: null,
  comment: null,
  lat: 55.75,
  lng: 37.61,
  isDefault: false,
};

describe("formatAddress", () => {
  it("склеивает город и улицу", () => {
    expect(formatAddress(base)).toBe("Москва, ул. Ленина, д. 10");
  });

  it("добавляет квартиру с префиксом и индекс", () => {
    expect(formatAddress({ ...base, apt: "42", zip: "101000" })).toBe(
      "Москва, ул. Ленина, д. 10, кв./оф. 42, 101000",
    );
  });

  it("пропускает пустые поля (apt/zip)", () => {
    expect(formatAddress({ ...base, apt: "", zip: null })).toBe("Москва, ул. Ленина, д. 10");
  });
});
