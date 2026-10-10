import { expect, type Page } from "@playwright/test";

/** Уникальный email на прогон — чтобы регистрация не падала на дубликате в реальной БД. */
export function uniqueEmail(): string {
  return `e2e+${Date.now()}${Math.floor(Math.random() * 1000)}@test.local`;
}

/**
 * Регистрация нового пользователя через модалку в хедере.
 * Возвращает email. По завершении пользователь авторизован (в хедере — кнопка «Выйти»).
 */
export async function registerNewUser(page: Page): Promise<string> {
  const email = uniqueEmail();
  await page.goto("/");

  // Хедер: единственная кнопка «Войти» открывает модалку
  await page.getByRole("button", { name: "Войти" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByRole("tab", { name: "Регистрация" }).click();
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByLabel("Пароль", { exact: true }).fill("password123");
  await dialog.getByRole("button", { name: "Зарегистрироваться" }).click();

  // Модалка закрылась, в хедере появилась кнопка выхода
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Выйти" })).toBeVisible();

  return email;
}

/** Добавляет первый товар каталога в корзину и ждёт появления бейджа корзины. */
export async function addFirstProductToCart(page: Page): Promise<void> {
  await page.goto("/catalog");
  await page.getByRole("button", { name: "В корзину" }).first().click();
  await expect(page.getByLabel(/в корзине/).first()).toBeVisible();
}
