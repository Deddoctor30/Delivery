import type { CartItem } from "@/entities/cart";

import { clearGuestCart, readGuestCart, writeGuestCart } from "./guest-storage";

const item: CartItem = { product: { id: "p1", title: "Пицца", price: 500 }, quantity: 2 };

describe("guest-storage", () => {
  beforeEach(() => localStorage.clear());

  it("пустое хранилище → []", () => {
    expect(readGuestCart()).toEqual([]);
  });

  it("write → read возвращает те же позиции", () => {
    writeGuestCart([item]);
    expect(readGuestCart()).toEqual([item]);
  });

  it("clear очищает корзину", () => {
    writeGuestCart([item]);
    clearGuestCart();
    expect(readGuestCart()).toEqual([]);
  });

  it("битый JSON → [] (не кидает)", () => {
    localStorage.setItem("guest-cart:v1", "{не json");
    expect(readGuestCart()).toEqual([]);
  });
});
