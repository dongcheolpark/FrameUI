import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("isOpen이 false면 렌더링되지 않는다", () => {
    render(<Modal isOpen={false} title="Test Modal" />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("isOpen이 true면 렌더링되고 data-state가 open이다", () => {
    render(<Modal isOpen={true} title="Test Modal" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.parentElement).toHaveAttribute("data-state", "open");
    expect(screen.getByText("Test Modal")).toBeDefined();
  });

  it("닫기 버튼 클릭 시 onOpenChange를 호출한다", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<Modal isOpen={true} onOpenChange={onOpenChange} />);

    await user.click(screen.getByLabelText("Close"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});