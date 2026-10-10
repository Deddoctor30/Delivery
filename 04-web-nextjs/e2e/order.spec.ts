import { expect, test } from "@playwright/test";

import { registerNewUser } from "./helpers";

test.describe("Полный заказ — авторизованный пользователь", () => {
  test("регистрация → корзина → checkout → success → заказ в /orders → отмена", async ({
    page,
  }) => {
    // 1. Регистрация нового пользователя (далее корзина — серверная)
    await registerNewUser(page);

    // 2. Добавляем товар в корзину из каталога
    await page.goto("/catalog");
    await page.getByRole("button", { name: "В корзину" }).first().click();
    await expect(page.getByLabel(/в корзине/).first()).toBeVisible();

    // 3. Оформляем заказ: координаты по умолчанию (Москва), адрес вводим вручную
    await page.goto("/checkout");
    await page.getByLabel("Улица, дом").fill("ул. Тестовая, д. 1");
    await page.getByLabel("Город").fill("Москва");

    const pay = page.getByRole("button", { name: "Оплатить" });
    await expect(pay).toBeEnabled();
    await pay.click();

    // 4. Экран успеха
    await expect(page).toHaveURL(/\/checkout\/success/);
    await expect(page.getByRole("heading", { name: "Заказ оформлен!" })).toBeVisible();

    // 5. Заказ виден в списке
    await page.goto("/orders");
    const orderCard = page.getByRole("heading", { name: /Заказ #/ }).first();
    await expect(orderCard).toBeVisible();

    // 6. Отмена заказа
    await page.getByRole("button", { name: "Отменить заказ" }).first().click();
    await expect(page.getByText("Заказ отменён")).toBeVisible();
  });
});
