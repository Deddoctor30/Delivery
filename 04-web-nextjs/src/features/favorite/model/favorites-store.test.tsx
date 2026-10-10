import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { openAuthModal } from "@/shared/lib/auth-modal";

import { addFavoriteAction, removeFavoriteAction } from "../api/actions";
import { FavoritesProvider, useFavorites } from "./favorites-store";

vi.mock("../api/actions", () => ({
  addFavoriteAction: vi.fn(),
  removeFavoriteAction: vi.fn(),
}));
vi.mock("@/shared/lib/auth-modal", () => ({ openAuthModal: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

function makeWrapper(isAuthenticated: boolean, initialIds: string[] = []) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <FavoritesProvider isAuthenticated={isAuthenticated} initialIds={initialIds}>
        {children}
      </FavoritesProvider>
    );
  };
}

describe("favorites-store", () => {
  beforeEach(() => vi.clearAllMocks());

  it("isFavorite отражает initialIds", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: makeWrapper(true, ["x"]) });
    expect(result.current.isFavorite("x")).toBe(true);
    expect(result.current.isFavorite("y")).toBe(false);
  });

  it("гость: toggle открывает модалку входа и не меняет состояние", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: makeWrapper(false) });
    act(() => result.current.toggle("p1"));
    expect(openAuthModal).toHaveBeenCalledOnce();
    expect(result.current.isFavorite("p1")).toBe(false);
    expect(addFavoriteAction).not.toHaveBeenCalled();
  });

  it("авторизованный: успешный toggle добавляет в избранное", async () => {
    vi.mocked(addFavoriteAction).mockResolvedValue({ ok: true, ids: ["p1"] });
    const { result } = renderHook(() => useFavorites(), { wrapper: makeWrapper(true) });
    await act(async () => {
      result.current.toggle("p1");
    });
    expect(addFavoriteAction).toHaveBeenCalledWith("p1");
    expect(result.current.isFavorite("p1")).toBe(true);
  });

  it("авторизованный: ошибка экшена → откат оптимистичного изменения + toast", async () => {
    vi.mocked(addFavoriteAction).mockResolvedValue({ ok: false, error: "boom" });
    const { result } = renderHook(() => useFavorites(), { wrapper: makeWrapper(true) });
    await act(async () => {
      result.current.toggle("p1");
    });
    expect(result.current.isFavorite("p1")).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("boom");
  });

  it("авторизованный: снятие из избранного вызывает removeFavoriteAction", async () => {
    vi.mocked(removeFavoriteAction).mockResolvedValue({ ok: true, ids: [] });
    const { result } = renderHook(() => useFavorites(), { wrapper: makeWrapper(true, ["p1"]) });
    await act(async () => {
      result.current.toggle("p1");
    });
    expect(removeFavoriteAction).toHaveBeenCalledWith("p1");
    expect(result.current.isFavorite("p1")).toBe(false);
  });
});
