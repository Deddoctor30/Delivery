import { CheckoutPage } from "@/views/checkout";

/**
 * Тонкий роут /checkout.
 *
 * Вся вёрстка и логика — в CheckoutPage (views/checkout).
 * Роут только монтирует экран.
 */
export default function CheckoutRoute() {
  return <CheckoutPage />;
}
