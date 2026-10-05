import { CheckoutSuccessPage } from "@/views/checkout-success";

/**
 * Тонкий роут /checkout/success.
 *
 * Вся вёрстка — в CheckoutSuccessPage (views/checkout-success).
 * Роут только монтирует экран.
 */
export default function CheckoutSuccessRoute() {
  return <CheckoutSuccessPage />;
}
