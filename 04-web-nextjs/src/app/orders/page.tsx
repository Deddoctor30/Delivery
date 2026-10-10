import { OrdersPage } from "@/views/orders";

/**
 * /orders — экран «Мои заказы».
 *
 * Приватная страница: guard в src/proxy.ts перенаправляет неаутентифицированных
 * пользователей на главную (?auth=required).
 *
 * Роут намеренно тонкий: вся логика — в OrdersPage (views/orders).
 */
export default function Page() {
  return <OrdersPage />;
}

export const metadata = {
  title: "Мои заказы",
};
