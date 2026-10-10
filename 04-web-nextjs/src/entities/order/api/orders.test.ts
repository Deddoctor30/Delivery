import type { components } from "@/shared/api/schema";

import { toOrder, toOrderSummary } from "./orders";

type ProductDto = components["schemas"]["ProductDto"];
type OrderItemDto = components["schemas"]["OrderItemDto"];
type OrderSummaryDto = components["schemas"]["OrderSummaryDto"];
type OrderDto = components["schemas"]["OrderDto"];

function makeProduct(over: Partial<ProductDto> = {}): ProductDto {
  return {
    id: "p1",
    categoryId: "c1",
    slug: "p",
    name: "Пицца",
    description: "d",
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

function makeItem(over: Partial<OrderItemDto> = {}): OrderItemDto {
  return {
    id: "i1",
    orderId: "o1",
    productId: "p1",
    priceSnapshot: 10000,
    quantity: 2,
    product: makeProduct(),
    ...over,
  };
}

function makeSummary(over: Partial<OrderSummaryDto> = {}): OrderSummaryDto {
  return {
    id: "clorderabc123XYZ",
    userId: "u1",
    status: "created",
    totalAmount: 20000,
    deliveryAmount: 14900,
    deliveryAddress: "Москва, Тверская 1",
    deliveryLat: 55.76,
    deliveryLng: 37.61,
    estimatedDays: 2,
    refunded: false,
    createdAt: "2026-01-01T10:00:00.000Z",
    cancelledAt: null,
    completedAt: null,
    items: [makeItem()],
    ...over,
  };
}

describe("toOrderSummary", () => {
  it("суммы в рублях, номер из хвоста id, статус и адрес", () => {
    const o = toOrderSummary(makeSummary());
    expect(o.subtotal).toBe(200);
    expect(o.deliveryPrice).toBe(149);
    expect(o.total).toBe(349);
    expect(o.number).toBe("123XYZ"); // последние 6 символов id в upper-case
    expect(o.status).toBe("created");
    expect(o.address).toBe("Москва, Тверская 1");
  });

  it("номер — последние 6 символов id в верхнем регистре", () => {
    const o = toOrderSummary(makeSummary({ id: "abcdef123456" }));
    expect(o.number).toBe("123456");
  });

  it("позиции смаплены: цена в рублях, относительный imageUrl", () => {
    const o = toOrderSummary(makeSummary({ items: [makeItem({ priceSnapshot: 5000 })] }));
    expect(o.items).toHaveLength(1);
    expect(o.items[0]!.price).toBe(50);
    expect(o.items[0]!.title).toBe("Пицца");
    expect(o.items[0]!.imageUrl).toBe("/static/products/p.webp");
  });

  it("summary не содержит statusTimestamps", () => {
    expect(toOrderSummary(makeSummary()).statusTimestamps).toBeUndefined();
  });
});

describe("toOrder", () => {
  it("добавляет statusTimestamps из истории", () => {
    const dto: OrderDto = {
      ...makeSummary({ id: "abcdef123456" }),
      history: [
        {
          id: "h1",
          orderId: "abcdef123456",
          status: "created",
          source: "client",
          changedAt: "2026-01-01T10:00:00.000Z",
        },
      ],
    };
    const o = toOrder(dto);
    expect(o.number).toBe("123456");
    expect(o.statusTimestamps).toBeDefined();
    expect(o.statusTimestamps!.created).toBeTruthy();
  });
});
