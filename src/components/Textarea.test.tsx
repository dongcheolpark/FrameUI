import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("uncontrolled 모드에서 값이 변경된다", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="메시지" defaultValue="hi" />);

    const textarea = screen.getByRole("textbox", { name: "메시지" });
    await user.type(textarea, " there");

    expect(textarea).toHaveValue("hi there");
  });

  it("onValueChange를 호출한다", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(<Textarea aria-label="설명" onValueChange={onValueChange} />);

    const textarea = screen.getByRole("textbox", { name: "설명" });
    await user.type(textarea, "abc");

    expect(onValueChange).toHaveBeenLastCalledWith("abc");
  });

  it("submit 모드에서 Enter 입력 시 onSubmitEnter를 호출한다", () => {
    const onSubmitEnter = vi.fn();

    render(
      <Textarea
        aria-label="채팅"
        defaultValue="hello"
        enterKeyBehavior="submit"
        onSubmitEnter={onSubmitEnter}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "채팅" });
    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(onSubmitEnter).toHaveBeenCalledTimes(1);
    expect(onSubmitEnter).toHaveBeenCalledWith("hello", expect.anything());
  });

  it("submit 모드에서도 Shift+Enter는 submit을 호출하지 않는다", () => {
    const onSubmitEnter = vi.fn();

    render(
      <Textarea
        aria-label="채팅 Shift"
        enterKeyBehavior="submit"
        onSubmitEnter={onSubmitEnter}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "채팅 Shift" });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(onSubmitEnter).not.toHaveBeenCalled();
  });

  it("IME 조합 중 Enter는 submit을 호출하지 않는다", () => {
    const onSubmitEnter = vi.fn();

    render(
      <Textarea
        aria-label="채팅 IME"
        enterKeyBehavior="submit"
        onSubmitEnter={onSubmitEnter}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "채팅 IME" });
    fireEvent.keyDown(textarea, { key: "Enter", isComposing: true });

    expect(onSubmitEnter).not.toHaveBeenCalled();
  });

  it("maxRows를 넘기면 data-overflow를 노출한다", () => {
    render(
      <Textarea
        aria-label="긴 내용"
        defaultValue={"line1\nline2\nline3"}
        minRows={1}
        maxRows={2}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "긴 내용" });

    expect(textarea).toHaveAttribute("rows", "2");
    expect(textarea).toHaveAttribute("data-overflow");
  });

  it("disabled/readOnly/invalid 상태를 data 속성으로 노출한다", () => {
    render(<Textarea aria-label="상태" disabled readOnly invalid />);

    const textarea = screen.getByRole("textbox", { name: "상태" });

    expect(textarea).toHaveAttribute("data-disabled");
    expect(textarea).toHaveAttribute("data-readonly");
    expect(textarea).toHaveAttribute("data-invalid");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  describe("Compound Components & Slots", () => {
    it("actionSlot을 제공하면 확장된 Wrapper와 Action 슬롯을 렌더링한다", () => {
      render(
        <Textarea
          aria-label="채팅옵션"
          actionSlot={<button type="button">전송버튼</button>}
        />,
      );
      
      const textbox = screen.getByRole("textbox", { name: "채팅옵션" });
      const button = screen.getByRole("button", { name: "전송버튼" });
      
      expect(textbox).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it("Compound Pattern을 통해 수동 설계 렌더링이 가능하다", () => {
      render(
        <Textarea.Root data-testid="custom-wrapper">
          <Textarea.Input aria-label="직접제어입력" />
          <Textarea.Action>
            <button>확인버튼</button>
          </Textarea.Action>
        </Textarea.Root>,
      );

      expect(screen.getByTestId("custom-wrapper")).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: "직접제어입력" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "확인버튼" })).toBeInTheDocument();
    });
  });
});
