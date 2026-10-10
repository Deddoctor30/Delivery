import type { Product } from "@/entities/product/@x/cart";

/** Позиция корзины: товар + количество. */
export interface CartItem {
  product: Product;
  quantity: number;
}

/** Корзина целиком. `total` — сумма к оплате в рублях (товары, без доставки). */
export interface Cart {
  items: CartItem[];
  total: number;
}
