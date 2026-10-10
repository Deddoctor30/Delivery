import { render, screen } from "@testing-library/react";

import { StatusTimeline } from "./status-timeline";

describe("StatusTimeline", () => {
  it("рендерит все 6 шагов последовательности", () => {
    render(<StatusTimeline currentStatus="processing" />);
    for (const label of [
      "Создан",
      "В обработке",
      "Курьер забрал",
      "В доставке",
      "Прибыл",
      "Завершён",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("показывает временну́ю метку статуса", () => {
    render(<StatusTimeline currentStatus="created" timestamps={{ created: "1 янв, 10:00" }} />);
    expect(screen.getByText("1 янв, 10:00")).toBeInTheDocument();
  });

  it("cancelled добавляет терминальный шаг «Отменён»", () => {
    render(<StatusTimeline currentStatus="cancelled" />);
    expect(screen.getByText("Отменён")).toBeInTheDocument();
  });

  it("не-отменённый заказ не показывает «Отменён»", () => {
    render(<StatusTimeline currentStatus="completed" />);
    expect(screen.queryByText("Отменён")).toBeNull();
  });
});
