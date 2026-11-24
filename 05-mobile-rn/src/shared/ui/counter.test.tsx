import { fireEvent, render } from "@testing-library/react-native";

import { Counter } from "./counter";

describe("Counter", () => {
  it("увеличивает значение на 1 по кнопке «Увеличить»", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(<Counter value={2} onChange={onChange} />);
    fireEvent.press(getByLabelText("Увеличить"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("уменьшает значение на 1 по кнопке «Уменьшить»", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(<Counter value={3} min={1} onChange={onChange} />);
    fireEvent.press(getByLabelText("Уменьшить"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("показывает текущее значение", async () => {
    const { getByText } = await render(<Counter value={7} onChange={jest.fn()} />);
    expect(getByText("7")).toBeTruthy();
  });
});
