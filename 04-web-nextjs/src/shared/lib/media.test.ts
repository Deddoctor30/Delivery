import { mediaUrl } from "./media";

describe("mediaUrl", () => {
  it("возвращает null для пустого значения", () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeNull();
    expect(mediaUrl("")).toBeNull();
  });

  it("оставляет абсолютный http(s) URL как есть", () => {
    expect(mediaUrl("http://cdn.example/x.webp")).toBe("http://cdn.example/x.webp");
    expect(mediaUrl("https://cdn.example/x.webp")).toBe("https://cdn.example/x.webp");
  });

  it("относительный путь приводит к same-origin (ведущий слэш)", () => {
    expect(mediaUrl("/static/products/p.webp")).toBe("/static/products/p.webp");
    expect(mediaUrl("static/products/p.webp")).toBe("/static/products/p.webp");
  });
});
