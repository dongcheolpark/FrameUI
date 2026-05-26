import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Popup } from "./Popup";

describe("Popup", () => {
  it("메시지를 올바르게 노출한다", () => {
    render(<Popup isOpen={true} message="성공했습니다!" />);
    expect(screen.getByText("성공했습니다!")).toBeDefined();
  });

  it("지정된 시간이 지나면 자동으로 닫힌다", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(<Popup isOpen={true} onOpenChange={onOpenChange} duration={1000} />);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });
});