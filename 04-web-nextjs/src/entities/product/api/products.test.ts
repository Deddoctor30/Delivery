import type { components } from "@/shared/api/schema";

import { toProduct } from "./products";

type ProductDto = components["schemas"]["ProductDto"];

function makeProduct(over: Partial<ProductDto> = {}): ProductDto {
  return {
    id: "p1",
    categoryId: "c1",
    slug: "p",
    name: "Товар",
    description: "описание",
    price: 10000,
    discountPrice: null,
    imageUrl: "/static/products/p.webp",
    stock: 5,
    isPopular: false,
    isSeasonal: false,
    season: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

describe("toProduct", () => {
  it("копейки → рубли + базовые поля", () => {
    const p = toProduct(makeProduct({ price: 15000 }));
    expect(p.price).toBe(150);
    expect(p.title).toBe("Товар");
    expect(p.oldPrice).toBeUndefined();
    expect(p.discountPercent).toBeUndefined();
    expect(p.inStock).toBe(true);
    expect(p.imageUrl).toBe("/static/products/p.webp");
    expect(p.category).toBe("c1");
  });

  it("скидка: price=скидочная, oldPrice=исходная, процент посчитан", () => {
    const p = toProduct(makeProduct({ price: 10000, discountPrice: 8000 }));
    expect(p.price).toBe(80);
    expect(p.oldPrice).toBe(100);
    expect(p.discountPercent).toBe(20);
  });

  it("stock 0 → не в наличии", () => {
    expect(toProduct(makeProduct({ stock: 0 })).inStock).toBe(false);
  });

  it("discountPrice >= price скидкой не считается", () => {
    const p = toProduct(makeProduct({ price: 10000, discountPrice: 10000 }));
    expect(p.oldPrice).toBeUndefined();
    expect(p.discountPercent).toBeUndefined();
    expect(p.price).toBe(100);
  });
});
