import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import type { CartItem } from "@/entities/cart";
import type { Product } from "@/entities/product";

import { readGuestCart } from "./guest-storage";
import { CartProvider, useCart } from "./cart-store";

// Серверные экшены не нужны в гостевом режиме — заглушаем (иначе тянется server-only).
vi.mock("../api/actions", () => ({
  addItemAction: vi.fn(),
  updateItemAction: vi.fn(),
  removeItemAction: vi.fn(),
  clearCartAction: vi.fn(),
  mergeCartAction: vi.fn(),
  repeatOrderAction: vi.fn(),
}));

const pizza: Product = { id: "p1", title: "Пицца", price: 500 };
const cola: Product = { id: "p2", title: "Кола", price: 100 };

function guestWrapper({ children }: { children: ReactNode }) {
  return (
    <CartProvider isAuthenticated={false} initialLines={[]}>
      {children}
    </CartProvider>
  );
}

function renderCart() {
  return renderHook(() => useCart(), { wrapper: guestWrapper });
}

describe("cart-store (гость)", () => {
  beforeEach(() => localStorage.clear());

  it("addItem добавляет позицию, считает count/subtotal и пишет в localStorage", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza, 2));
    expect(result.current.count).toBe(2);
    expect(result.current.subtotal).toBe(1000);
    expect(readGuestCart()).toEqual([{ product: pizza, quantity: 2 }]);
  });

  it("addItem того же товара увеличивает количество", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza, 1));
    act(() => result.current.addItem(pizza, 2));
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.count).toBe(3);
  });

  it("setQuantity меняет количество, а <=0 удаляет позицию", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza, 1));
    act(() => result.current.setQuantity("p1", 5));
    expect(result.current.count).toBe(5);
    act(() => result.current.setQuantity("p1", 0));
    expect(result.current.lines).toHaveLength(0);
  });

  it("removeItem убирает позицию", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza, 1));
    act(() => result.current.addItem(cola, 1));
    act(() => result.current.removeItem("p1"));
    expect(result.current.lines).toEqual([{ product: cola, quantity: 1 }]);
  });

  it("clear опустошает корзину и localStorage", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza, 1));
    act(() => result.current.clear());
    expect(result.current.lines).toHaveLength(0);
    expect(readGuestCart()).toEqual([]);
  });

  it("гидратируется из localStorage при монтировании", () => {
    const seeded: CartItem[] = [{ product: cola, quantity: 3 }];
    localStorage.setItem("guest-cart:v1", JSON.stringify(seeded));
    const { result } = renderCart();
    expect(result.current.count).toBe(3);
    expect(result.current.subtotal).toBe(300);
  });
});
