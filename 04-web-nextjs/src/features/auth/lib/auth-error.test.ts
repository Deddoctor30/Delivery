import { authErrorMessage } from "./auth-error";

describe("authErrorMessage", () => {
  it("429 → лимит попыток (приоритетнее кода)", () => {
    expect(authErrorMessage(429, "INVALID_CREDENTIALS", "login")).toMatch(/Слишком много/);
  });

  it("мапит известные коды на русский", () => {
    expect(authErrorMessage(401, "USER_NOT_FOUND", "login")).toMatch(/не найден/);
    expect(authErrorMessage(401, "INVALID_CREDENTIALS", "login")).toMatch(/Неверный/);
    expect(authErrorMessage(409, "EMAIL_TAKEN", "register")).toMatch(/уже зарегистрирован/);
    expect(authErrorMessage(400, "BAD_REQUEST", "login")).toMatch(/Проверьте/);
  });

  it("неизвестный код → дефолт по режиму", () => {
    expect(authErrorMessage(500, undefined, "login")).toBe("Не удалось войти");
    expect(authErrorMessage(500, "WEIRD", "register")).toBe("Не удалось зарегистрироваться");
  });
});
