import {
  ORDER_STATUS_BADGE_VARIANT,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_SEQUENCE,
  type OrderStatus,
} from "./types";

describe("карты статусов заказа", () => {
  it("у каждого статуса есть лейбл и вариант бейджа", () => {
    const all: OrderStatus[] = [...ORDER_STATUS_SEQUENCE, "cancelled"];
    for (const s of all) {
      expect(ORDER_STATUS_LABELS[s]).toBeTruthy();
      expect(ORDER_STATUS_BADGE_VARIANT[s]).toBeTruthy();
    }
  });
  it("линейная последовательность не содержит cancelled", () => {
    expect(ORDER_STATUS_SEQUENCE).not.toContain("cancelled");
  });
});
