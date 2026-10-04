import { CartPage } from "@/views/cart";

/**
 * Тонкий роут /cart.
 *
 * Вся вёрстка и логика — в CartPage (views/cart).
 * Роут только монтирует экран.
 */
export default function CartRoute() {
  return <CartPage />;
}
