import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./Switch";

describe("Switch", () => {
  it("기본 상태는 unchecked를 노출한다", () => {
    render(<Switch aria-label="알림" />);

    const switchElement = screen.getByRole("switch", { name: "알림" });

    expect(switchElement).toHaveAttribute("data-state", "unchecked");
    expect(switchElement).toHaveAttribute("aria-checked", "false");
  });

  it("uncontrolled 모드에서 클릭 시 토글된다", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="다크모드" defaultChecked={false} />);

    const switchElement = screen.getByRole("switch", { name: "다크모드" });
    await user.click(switchElement);

    expect(switchElement).toHaveAttribute("data-state", "checked");
    expect(switchElement).toHaveAttribute("aria-checked", "true");
  });

  it("onCheckedChange를 호출한다", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch aria-label="자동저장" onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("switch", { name: "자동저장" }));

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

    const switchElement = screen.getByRole("switch", { name: "푸시 알림" });
    await user.click(switchElement);

    expect(switchElement).toHaveAttribute("data-state", "checked");
    expect(switchElement).toHaveAttribute("data-disabled");
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
