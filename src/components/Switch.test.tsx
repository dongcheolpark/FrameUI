import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./Switch";

describe("Switch", () => {
  it("기본 상태는 unchecked를 노출한다", () => {
    render(<Switch aria-label="알림" />);

    const labelElement = screen.getByRole("checkbox", {
      name: "알림",
    }).parentElement;

    expect(labelElement).toHaveAttribute("data-state", "unchecked");
  });

  it("uncontrolled 모드에서 클릭 시 토글된다", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="다크모드" defaultChecked={false} />);

    const checkboxElement = screen.getByRole("checkbox", { name: "다크모드" });
    await user.click(checkboxElement);

    expect(checkboxElement.parentElement).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("onCheckedChange를 호출한다", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch aria-label="자동저장" onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("checkbox", { name: "자동저장" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it("disabled면 상태를 바꾸지 않는다", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Switch
        aria-label="푸시 알림"
        defaultChecked={true}
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );

    const checkboxElement = screen.getByRole("checkbox", { name: "푸시 알림" });
    const labelElement = checkboxElement.parentElement;

    await user.click(checkboxElement);

    expect(labelElement).toHaveAttribute("data-state", "checked");
    expect(labelElement).toHaveAttribute("data-disabled");
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
