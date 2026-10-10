import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Counter } from "./counter";

describe("Counter", () => {
  it("рендерит текущее значение", () => {
    render(<Counter value={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("инкремент/декремент зовут onValueChange с ±1", async () => {
    const onValueChange = vi.fn();
    render(<Counter value={2} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByLabelText("Увеличить"));
    await userEvent.click(screen.getByLabelText("Уменьшить"));
    expect(onValueChange).toHaveBeenNthCalledWith(1, 3);
    expect(onValueChange).toHaveBeenNthCalledWith(2, 1);
  });

  it("onIncrement/onDecrement приоритетнее onValueChange", async () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Counter
        value={2}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByLabelText("Увеличить"));
    await userEvent.click(screen.getByLabelText("Уменьшить"));
    expect(onIncrement).toHaveBeenCalledOnce();
    expect(onDecrement).toHaveBeenCalledOnce();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("на нижней границе (min) декремент заблокирован и колбэк не зовётся", async () => {
    const onValueChange = vi.fn();
    render(<Counter value={0} min={0} onValueChange={onValueChange} />);
    const dec = screen.getByLabelText("Уменьшить");
    expect(dec).toBeDisabled();
    await userEvent.click(dec);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("на верхней границе (max) инкремент заблокирован", () => {
    render(<Counter value={5} max={5} />);
    expect(screen.getByLabelText("Увеличить")).toBeDisabled();
  });

  it("disabled блокирует обе кнопки", () => {
    render(<Counter value={2} disabled />);
    expect(screen.getByLabelText("Увеличить")).toBeDisabled();
    expect(screen.getByLabelText("Уменьшить")).toBeDisabled();
  });
});
