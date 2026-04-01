import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { CheckboxCards } from "./CheckboxCards";

afterEach(() => cleanup());

const defaultOptions = [
  { value: "a", label: "Option A", description: "Description A" },
  { value: "b", label: "Option B" },
  { value: "c", label: "Option C", disabled: true },
];

// --- 헬퍼 ---
function getCheckbox(checkboxes: HTMLElement[], index: number): HTMLElement {
  const el = checkboxes[index];
  if (!el) throw new Error(`checkbox at index ${index} not found`);
  return el;
}

function getItem(checkbox: HTMLElement): Element {
  const item = checkbox.closest("[data-ui='checkbox-cards-item']");
  if (!item) throw new Error("checkbox-cards-item not found");
  return item;
}

// --- 기본 모드 ---
describe("CheckboxCards (기본 모드)", () => {
  it("options를 렌더링한다", () => {
    render(<CheckboxCards options={defaultOptions} />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();
  });

  it("description이 있는 경우 렌더링한다", () => {
    render(<CheckboxCards options={defaultOptions} />);
    expect(screen.getByText("Description A")).toBeInTheDocument();
  });

  it("disabled 옵션의 checkbox는 비활성화된다", () => {
    render(<CheckboxCards options={defaultOptions} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(getCheckbox(checkboxes, 2)).toBeDisabled();
  });
});

// --- Uncontrolled ---
describe("CheckboxCards (uncontrolled)", () => {
  it("defaultValue로 초기 선택 상태를 설정한다", () => {
    render(<CheckboxCards options={defaultOptions} defaultValue={["a"]} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(getCheckbox(checkboxes, 0)).toBeChecked();
    expect(getCheckbox(checkboxes, 1)).not.toBeChecked();
  });

  it("클릭 시 선택 상태가 토글된다", () => {
    render(<CheckboxCards options={defaultOptions} />);
    const checkboxes = screen.getAllByRole("checkbox");
    const first = getCheckbox(checkboxes, 0);
    fireEvent.click(first);
    expect(first).toBeChecked();
    fireEvent.click(first);
    expect(first).not.toBeChecked();
  });
});

// --- Controlled ---
describe("CheckboxCards (controlled)", () => {
  it("value prop으로 선택 상태를 제어한다", () => {
    render(<CheckboxCards options={defaultOptions} value={["b"]} onValueChange={() => {}} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(getCheckbox(checkboxes, 0)).not.toBeChecked();
    expect(getCheckbox(checkboxes, 1)).toBeChecked();
  });

  it("클릭 시 onValueChange가 올바른 값으로 호출된다", () => {
    const onValueChange = vi.fn();
    render(<CheckboxCards options={defaultOptions} value={[]} onValueChange={onValueChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(getCheckbox(checkboxes, 0));
    expect(onValueChange).toHaveBeenCalledWith(["a"]);
  });

  it("이미 선택된 항목 클릭 시 제거된 배열로 호출된다", () => {
    const onValueChange = vi.fn();
    render(<CheckboxCards options={defaultOptions} value={["a", "b"]} onValueChange={onValueChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(getCheckbox(checkboxes, 0));
    expect(onValueChange).toHaveBeenCalledWith(["b"]);
  });
});

// --- Root disabled ---
describe("CheckboxCards (root disabled)", () => {
  it("root disabled 시 모든 checkbox가 비활성화된다", () => {
    render(<CheckboxCards options={defaultOptions} disabled />);
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((cb) => expect(cb).toBeDisabled());
  });

  it("root disabled 시 클릭해도 onValueChange가 호출되지 않는다", () => {
    const onValueChange = vi.fn();
    render(<CheckboxCards options={defaultOptions} disabled value={[]} onValueChange={onValueChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(getCheckbox(checkboxes, 0));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

// --- Compound 모드 ---
describe("CheckboxCards (compound 모드)", () => {
  it("children으로 렌더링된다", () => {
    render(
      <CheckboxCards defaultValue={[]}>
        <CheckboxCards.Item value="x">
          <CheckboxCards.Indicator />
          <CheckboxCards.Label>Custom Label</CheckboxCards.Label>
        </CheckboxCards.Item>
      </CheckboxCards>
    );
    expect(screen.getByText("Custom Label")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("Root 서브 컴포넌트로도 렌더링된다", () => {
    render(
      <CheckboxCards.Root defaultValue={[]}>
        <CheckboxCards.Item value="x">
          <CheckboxCards.Indicator />
          <CheckboxCards.Label>Custom Label</CheckboxCards.Label>
        </CheckboxCards.Item>
      </CheckboxCards.Root>
    );
    expect(screen.getByText("Custom Label")).toBeInTheDocument();
  });

  it("Item 외부에서 Indicator 사용 시 에러를 던진다", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <CheckboxCards defaultValue={[]}>
          <CheckboxCards.Indicator />
        </CheckboxCards>
      )
    ).toThrow();
    consoleError.mockRestore();
  });

  it("Description이 렌더링된다", () => {
    render(
      <CheckboxCards defaultValue={[]}>
        <CheckboxCards.Item value="x">
          <CheckboxCards.Indicator />
          <CheckboxCards.Label>Label</CheckboxCards.Label>
          <CheckboxCards.Description>설명 텍스트</CheckboxCards.Description>
        </CheckboxCards.Item>
      </CheckboxCards>
    );
    expect(screen.getByText("설명 텍스트")).toBeInTheDocument();
  });
});

// --- data attributes ---
describe("CheckboxCards (data attributes)", () => {
  it("선택된 item에 data-checked 속성이 붙는다", () => {
    render(<CheckboxCards options={defaultOptions} defaultValue={["a"]} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(getItem(getCheckbox(checkboxes, 0))).toHaveAttribute("data-checked");
    expect(getItem(getCheckbox(checkboxes, 1))).not.toHaveAttribute("data-checked");
  });

  it("disabled item에 data-disabled 속성이 붙는다", () => {
    render(<CheckboxCards options={defaultOptions} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(getItem(getCheckbox(checkboxes, 2))).toHaveAttribute("data-disabled");
  });
});