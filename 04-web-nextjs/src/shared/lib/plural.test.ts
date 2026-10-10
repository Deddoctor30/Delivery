import { plural } from "./plural";

const forms: [string, string, string] = ["товар", "товара", "товаров"];

describe("plural", () => {
  it("форма «один» для 1, 21, 101 (но не 11)", () => {
    for (const n of [1, 21, 101, 131]) expect(plural(n, forms)).toBe("товар");
  });

  it("форма «несколько» для 2–4, 22–24", () => {
    for (const n of [2, 3, 4, 22, 33, 54, 103]) expect(plural(n, forms)).toBe("товара");
  });

  it("форма «много» для 0, 5–20, 11–14", () => {
    for (const n of [0, 5, 10, 11, 12, 13, 14, 15, 20, 25, 100, 111]) {
      expect(plural(n, forms)).toBe("товаров");
    }
  });
});
