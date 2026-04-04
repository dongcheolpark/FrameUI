import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CheckboxCards } from "./CheckboxCards";

afterEach(() => {
  cleanup();
});

describe("CheckboxCards", () => {
  it("기본 상태는 unchecked를 노출한다", () => {
    render(
      <CheckboxCards
        options={[{ value: "design", label: "디자인" }]}
      />,
    );

    const checkboxElement = screen.getByRole("checkbox", { name: "디자인" });

    expect(checkboxElement.parentElement).toHaveAttribute(
      "data-state",
      "unchecked",
    );
  });

  it("uncontrolled 모드에서 클릭 시 선택된다", async () => {
    const user = userEvent.setup();

    render(
      <CheckboxCards
        options={[{ value: "design", label: "디자인" }]}
        defaultValue={[]}
      />,
    );

    const checkboxElement = screen.getByRole("checkbox", { name: "디자인" });

    await user.click(checkboxElement);

    expect(checkboxElement.parentElement).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("다시 클릭하면 선택이 해제된다", async () => {
    const user = userEvent.setup();

    render(
      <CheckboxCards
        options={[{ value: "design", label: "디자인" }]}
        defaultValue={["design"]}
      />,
    );

    const checkboxElement = screen.getByRole("checkbox", { name: "디자인" });

    await user.click(checkboxElement);

    expect(checkboxElement.parentElement).toHaveAttribute(
      "data-state",
      "unchecked",
    );
  });

  it("복수 선택이 가능하다", async () => {
    const user = userEvent.setup();

    render(
      <CheckboxCards
        options={[
          { value: "design", label: "디자인" },
          { value: "frontend", label: "프론트엔드" },
        ]}
      />,
    );

    const designCheckbox = screen.getByRole("checkbox", { name: "디자인" });
    const frontendCheckbox = screen.getByRole("checkbox", {
      name: "프론트엔드",
    });

    await user.click(designCheckbox);
    await user.click(frontendCheckbox);

    expect(designCheckbox.parentElement).toHaveAttribute(
      "data-state",
      "checked",
    );

    expect(frontendCheckbox.parentElement).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("onValueChange를 호출한다", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <CheckboxCards
        options={[{ value: "design", label: "디자인" }]}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "디자인" }));

    expect(onValueChange).toHaveBeenCalledWith(["design"]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("disabled면 상태를 바꾸지 않는다", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <CheckboxCards
        options={[{ value: "design", label: "디자인" }]}
        defaultValue={["design"]}
        disabled
        onValueChange={onValueChange}
      />,
    );

    const checkboxElement = screen.getByRole("checkbox", { name: "디자인" });
    const labelElement = checkboxElement.parentElement;

    await user.click(checkboxElement);

    expect(labelElement).toHaveAttribute("data-state", "checked");
    expect(labelElement).toHaveAttribute("data-disabled");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("개별 옵션이 disabled면 상태를 바꾸지 않는다", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <CheckboxCards
        options={[
          {
            value: "design",
            label: "디자인",
            disabled: true,
          },
        ]}
        onValueChange={onValueChange}
      />,
    );

    const checkboxElement = screen.getByRole("checkbox", { name: "디자인" });
    const labelElement = checkboxElement.parentElement;

    await user.click(checkboxElement);

    expect(labelElement).toHaveAttribute("data-state", "unchecked");
    expect(labelElement).toHaveAttribute("data-disabled");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("controlled 모드에서 value를 기준으로 상태를 반영한다", () => {
    render(
      <CheckboxCards
        options={[
          { value: "design", label: "디자인" },
          { value: "frontend", label: "프론트엔드" },
        ]}
        value={["frontend"]}
        onValueChange={() => {}}
      />,
    );

    const designCheckbox = screen.getByRole("checkbox", { name: "디자인" });
    const frontendCheckbox = screen.getByRole("checkbox", {
      name: "프론트엔드",
    });

    expect(designCheckbox.parentElement).toHaveAttribute(
      "data-state",
      "unchecked",
    );

    expect(frontendCheckbox.parentElement).toHaveAttribute(
      "data-state",
      "checked",
    );
  });
});