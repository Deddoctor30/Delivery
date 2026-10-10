import { expect, test } from "@playwright/test";

import { addFirstProductToCart } from "./helpers";

test.describe("Каталог — гость", () => {
  test("каталог → товар → корзина", async ({ page }) => {
    await page.goto("/catalog");

    // Карточки загрузились
    const firstProductLink = page.locator('a[href^="/product/"]').first();
    await expect(firstProductLink).toBeVisible();

    // Проваливаемся в карточку товара
    await firstProductLink.click();
    await expect(page).toHaveURL(/\/product\//);

    // Добавляем в корзину (на странице товара aria-label «Добавить в корзину»)
    await page.getByRole("button", { name: "Добавить в корзину" }).click();

    // Бейдж корзины в хедере появился
    await expect(page.getByLabel(/в корзине/).first()).toBeVisible();

    // В корзине есть позиция → доступна кнопка оформления
    await page.goto("/cart");
    await expect(page.getByRole("link", { name: /Оформить заказ/ })).toBeVisible();
  });

  test("клик по «сердечку» открывает модалку входа", async ({ page }) => {
    await page.goto("/catalog");

    await page.getByRole("button", { name: "Добавить в избранное" }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Войти в аккаунт")).toBeVisible();
  });

  test("«Оплатить» в checkout у гостя открывает модалку входа", async ({ page }) => {
    await addFirstProductToCart(page);

    await page.goto("/checkout");

    // Форму надо заполнить — иначе сабмит упрётся в валидацию и до guard'а !user не дойдёт
    await page.getByLabel("Улица, дом").fill("ул. Тестовая, д. 1");
    await page.getByLabel("Город").fill("Москва");

    const pay = page.getByRole("button", { name: "Оплатить" });
    await expect(pay).toBeEnabled();
    await pay.click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
