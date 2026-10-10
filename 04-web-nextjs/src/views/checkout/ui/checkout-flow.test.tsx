import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { openAuthModal } from "@/shared/lib/auth-modal";
import { createOrderAction } from "@/features/checkout";

import { CheckoutFlow } from "./checkout-flow";

// Гость: заказ создаётся из серверной корзины → «Оплатить» должен открыть модалку входа.
const { mockUser } = vi.hoisted(() => ({ mockUser: { current: null as unknown } }));

vi.mock("@/features/auth", () => ({ useSession: () => ({ user: mockUser.current }) }));
vi.mock("@/features/cart", () => ({
  useCart: () => ({
    lines: [{ product: { id: "p1", title: "P", price: 500 }, quantity: 1 }],
    clear: vi.fn(),
  }),
}));
vi.mock("@/features/checkout", () => ({
  createOrderAction: vi.fn(),
  estimateDeliveryAction: vi.fn().mockResolvedValue({ ok: false, error: "x" }),
  reverseGeocodeAction: vi.fn(),
}));
vi.mock("@/shared/lib/auth-modal", () => ({ openAuthModal: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

// Карта тянет leaflet (не работает в jsdom) — подменяем, остальной DS реальный.
vi.mock("@/shared/ui", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/ui")>();
  return { ...actual, MapPicker: () => <div data-testid="map" /> };
});

describe("CheckoutFlow — guest guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.current = null;
  });

  it("гость с валидной формой: «Оплатить» открывает модалку, заказ не создаётся", async () => {
    render(<CheckoutFlow savedAddresses={[]} />);

    await userEvent.type(screen.getByLabelText("Улица, дом"), "ул. Ленина, д. 10");
    await userEvent.type(screen.getByLabelText("Город"), "Москва");
    await userEvent.click(screen.getByRole("button", { name: /Оплатить/ }));

    expect(openAuthModal).toHaveBeenCalledOnce();
    expect(createOrderAction).not.toHaveBeenCalled();
  });
});
