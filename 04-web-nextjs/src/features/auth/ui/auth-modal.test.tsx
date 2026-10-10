import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

import type { User } from "@/entities/user";

import { AuthModal } from "./auth-modal";

const { mockSetUser } = vi.hoisted(() => ({ mockSetUser: vi.fn() }));
vi.mock("../model/session", () => ({ useSession: () => ({ setUser: mockSetUser }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const user: User = {
  id: "u1",
  email: "a@b.ru",
  firstName: null,
  lastName: null,
  phone: null,
  avatarId: null,
  role: "CLIENT",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function mockFetch(res: { ok: boolean; status: number; body: unknown }) {
  const fn = vi.fn().mockResolvedValue({
    ok: res.ok,
    status: res.status,
    json: async () => res.body,
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

async function fillCreds() {
  await userEvent.type(screen.getByLabelText("Email"), "a@b.ru");
  await userEvent.type(screen.getByLabelText("Пароль"), "password123");
}

describe("AuthModal", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it("успешный вход: шлёт mode=login, зовёт setUser и закрывает", async () => {
    const fetchFn = mockFetch({ ok: true, status: 200, body: { user } });
    const onOpenChange = vi.fn();
    render(<AuthModal open onOpenChange={onOpenChange} />);

    await fillCreds();
    await userEvent.click(screen.getByRole("button", { name: "Войти" }));

    await waitFor(() => expect(fetchFn).toHaveBeenCalledOnce());
    const [, init] = fetchFn.mock.calls[0]!;
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      email: "a@b.ru",
      password: "password123",
      mode: "login",
    });
    expect(mockSetUser).toHaveBeenCalledWith(user);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ошибка входа: 401 USER_NOT_FOUND → русский toast, setUser не зовётся", async () => {
    mockFetch({ ok: false, status: 401, body: { code: "USER_NOT_FOUND" } });
    render(<AuthModal open onOpenChange={vi.fn()} />);

    await fillCreds();
    await userEvent.click(screen.getByRole("button", { name: "Войти" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect((toast.error as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatch(/не найден/);
    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it("вкладка «Регистрация»: шлёт mode=register", async () => {
    const fetchFn = mockFetch({ ok: true, status: 200, body: { user } });
    render(<AuthModal open onOpenChange={vi.fn()} />);

    await userEvent.click(screen.getByRole("tab", { name: "Регистрация" }));
    await fillCreds();
    await userEvent.click(screen.getByRole("button", { name: "Зарегистрироваться" }));

    await waitFor(() => expect(fetchFn).toHaveBeenCalledOnce());
    const [, init] = fetchFn.mock.calls[0]!;
    expect(JSON.parse((init as RequestInit).body as string).mode).toBe("register");
  });

  it("невалидный email → валидация блокирует сабмит (нет запроса, модалка открыта)", async () => {
    const fetchFn = mockFetch({ ok: true, status: 200, body: { user } });
    const onOpenChange = vi.fn();
    render(<AuthModal open onOpenChange={onOpenChange} />);

    await userEvent.type(screen.getByLabelText("Email"), "not-an-email");
    await userEvent.type(screen.getByLabelText("Пароль"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Войти" }));

    // даём zodResolver (async) отработать
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchFn).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
