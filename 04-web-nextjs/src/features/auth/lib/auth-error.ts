export type AuthMode = "login" | "register";

/** Человекочитаемый текст ошибки входа/регистрации по коду бэкенда и HTTP-статусу. */
export function authErrorMessage(status: number, code: string | undefined, mode: AuthMode): string {
  if (status === 429) return "Слишком много попыток. Попробуйте через минуту";
  switch (code) {
    case "USER_NOT_FOUND":
      return "Аккаунт с таким email не найден — зарегистрируйтесь";
    case "INVALID_CREDENTIALS":
      return "Неверный email или пароль";
    case "EMAIL_TAKEN":
      return "Этот email уже зарегистрирован — войдите";
    case "VALIDATION_ERROR":
    case "BAD_REQUEST":
      return "Проверьте email и пароль (минимум 8 символов)";
    default:
      return mode === "register" ? "Не удалось зарегистрироваться" : "Не удалось войти";
  }
}
