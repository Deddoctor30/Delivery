import type { Product } from "@/entities/product";

import { useCartStore } from "./cart-store";

const product = (id: string): Product => ({ id, title: `Товар ${id}`, price: 100 });

beforeEach(() => {
  useCartStore.setState({ lines: [] });
});

describe("cart store", () => {
  it("addItem добавляет позицию и суммирует количество одного товара", () => {
    const { addItem } = useCartStore.getState();
    addItem(product("1"), 2);
    addItem(product("1"), 3);

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ quantity: 5 });
    expect(lines[0]?.product.id).toBe("1");
  });

  it("setQuantity(0) удаляет позицию", () => {
    const { addItem, setQuantity } = useCartStore.getState();
    addItem(product("1"), 1);
    setQuantity("1", 0);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("setQuantity меняет количество существующей позиции", () => {
    const { addItem, setQuantity } = useCartStore.getState();
    addItem(product("1"), 1);
    setQuantity("1", 7);
    expect(useCartStore.getState().lines[0]).toMatchObject({ quantity: 7 });
  });

  it("removeItem убирает нужный товар, clear очищает всё", () => {
    const { addItem, removeItem, clear } = useCartStore.getState();
    addItem(product("1"), 1);
    addItem(product("2"), 1);

    removeItem("1");
    expect(useCartStore.getState().lines.map((l) => l.product.id)).toEqual(["2"]);

    clear();
    expect(useCartStore.getState().lines).toHaveLength(0);
  });
});
