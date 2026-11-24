import { render } from "@testing-library/react-native";

import { StatusTimeline } from "./status-timeline";

describe("StatusTimeline", () => {
  it("рисует все шаги линейной последовательности", async () => {
    const { getByText } = await render(<StatusTimeline currentStatus="in_delivery" />);
    expect(getByText("Создан")).toBeTruthy();
    expect(getByText("В доставке")).toBeTruthy();
    expect(getByText("Завершён")).toBeTruthy();
  });

  it("добавляет терминальный шаг «Отменён» при отмене", async () => {
    const { getByText } = await render(<StatusTimeline currentStatus="cancelled" />);
    expect(getByText("Отменён")).toBeTruthy();
  });

  it("подставляет метку времени для статуса", async () => {
    const { getByText } = await render(
      <StatusTimeline currentStatus="processing" timestamps={{ processing: "5 ноя, 14:30" }} />,
    );
    expect(getByText("5 ноя, 14:30")).toBeTruthy();
  });
});
