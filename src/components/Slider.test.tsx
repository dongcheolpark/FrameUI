import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Slider } from "./Slider";

describe("Slider", () => {
  it("기본값을 노출한다", () => {
    render(<Slider aria-label="볼륨" defaultValue={30} />);

    const sliderElement = screen.getByRole("slider", { name: "볼륨" });

    expect(sliderElement).toHaveValue("30");
  });

  it("uncontrolled 모드에서 값이 변경된다", () => {
    render(<Slider aria-label="밝기" defaultValue={10} />);

    const sliderElement = screen.getByRole("slider", { name: "밝기" });

    fireEvent.change(sliderElement, { target: { value: "55" } });

    expect(sliderElement).toHaveValue("55");
  });

  it("onValueChange를 호출한다", () => {
    const onValueChange = vi.fn();

    render(
      <Slider
        aria-label="속도"
        defaultValue={0}
        onValueChange={onValueChange}
      />,
    );

    const sliderElement = screen.getByRole("slider", { name: "속도" });

    fireEvent.change(sliderElement, { target: { value: "42" } });

    expect(onValueChange).toHaveBeenCalledWith(42);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("controlled 모드에서는 외부 값이 적용된다", () => {
    const onValueChange = vi.fn();

    render(
      <Slider
        aria-label="줌"
        value={70}
        onValueChange={onValueChange}
      />,
    );

    const sliderElement = screen.getByRole("slider", { name: "줌" });

    expect(sliderElement).toHaveValue("70");
  });

  it("disabled면 값을 바꾸지 않는다", () => {
    const onValueChange = vi.fn();

    render(
      <Slider
        aria-label="대비"
        defaultValue={20}
        disabled
        onValueChange={onValueChange}
      />,
    );

    const sliderElement = screen.getByRole("slider", { name: "대비" });
    const labelElement = sliderElement.parentElement;

    fireEvent.change(sliderElement, { target: { value: "80" } });

    expect(sliderElement).toBeDisabled();
    expect(labelElement).toHaveAttribute("data-disabled");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
