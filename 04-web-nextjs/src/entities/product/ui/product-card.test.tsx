/* eslint-disable @next/next/no-img-element */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Product } from "../model/types";

import { ProductCard } from "./product-card";

// next/image в jsdom не нужен — рендерим обычный <img>.
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const base: Product = { id: "p1", title: "Пицца Маргарита", price: 500, inStock: true };

describe("ProductCard", () => {
  it("рендерит название и цену, ссылки ведут на страницу товара", () => {
    render(<ProductCard product={base} />);
    expect(screen.getByText("Пицца Маргарита")).toBeInTheDocument();
    expect(screen.getByText("500 ₽")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.every((a) => a.getAttribute("href") === "/product/p1")).toBe(true);
  });

  it("скидка: старая цена и бейдж процента", () => {
    render(<ProductCard product={{ ...base, price: 400, oldPrice: 500, discountPercent: 20 }} />);
    expect(screen.getByText("400 ₽")).toBeInTheDocument();
    expect(screen.getByText("500 ₽")).toBeInTheDocument();
    expect(screen.getByText("−20%")).toBeInTheDocument();
  });

  it("нет в наличии: кнопка «Нет в наличии» задизейблена, «В корзину» нет", () => {
    render(<ProductCard product={{ ...base, inStock: false }} onAddToCart={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Нет в наличии" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /В корзину/ })).toBeNull();
  });

  it("клик «В корзину» зовёт onAddToCart", async () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={base} onAddToCart={onAddToCart} />);
    await userEvent.click(screen.getByRole("button", { name: /В корзину/ }));
    expect(onAddToCart).toHaveBeenCalledOnce();
  });

  it("при quantity>0 показывает Counter вместо кнопки", () => {
    render(<ProductCard product={base} quantity={2} onQuantityChange={vi.fn()} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /В корзину/ })).toBeNull();
  });
});
