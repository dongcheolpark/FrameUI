import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RadioCards } from "./RadioCards";

afterEach(() => {
  cleanup();
});

function getRadios(): [HTMLInputElement, HTMLInputElement] {
  const radios = screen.getAllByRole("radio") as HTMLInputElement[];

  if (radios.length < 2) {
    throw new Error("Expected at least 2 radio inputs");
  }

  return [radios[0]!, radios[1]!];
}

function getItems(): [HTMLElement, HTMLElement] {
  const [apple, banana] = getRadios();

  const appleItem = apple.closest('[data-ui="radio-cards-item"]');
  const bananaItem = banana.closest('[data-ui="radio-cards-item"]');

  if (!appleItem || !bananaItem) {
    throw new Error("Expected radio card items");
  }

  return [appleItem as HTMLElement, bananaItem as HTMLElement];
}

describe("RadioCards", () => {
  it("renders options", () => {
    render(
      <RadioCards
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ]}
      />
    );

    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("supports uncontrolled mode", async () => {
    const user = userEvent.setup();

    render(
      <RadioCards
        defaultValue="apple"
        name="fruit"
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ]}
      />
    );

    const [apple, banana] = getRadios();

    expect(apple.checked).toBe(true);
    expect(banana.checked).toBe(false);

    await user.click(banana);

    expect(apple.checked).toBe(false);
    expect(banana.checked).toBe(true);
  });

  it("supports controlled mode", async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const [value, setValue] = React.useState("apple");

      return (
        <RadioCards
          value={value}
          onValueChange={setValue}
          name="fruit"
          options={[
            { value: "apple", label: "Apple" },
            { value: "banana", label: "Banana" },
          ]}
        />
      );
    }

    render(<TestComponent />);

    const [apple, banana] = getRadios();

    expect(apple.checked).toBe(true);
    expect(banana.checked).toBe(false);

    await user.click(banana);

    expect(apple.checked).toBe(false);
    expect(banana.checked).toBe(true);
  });

  it("calls onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <RadioCards
        onValueChange={onValueChange}
        name="fruit"
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ]}
      />
    );

    const [, banana] = getRadios();

    await user.click(banana);

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("banana");
  });

  it("respects disabled at root", async () => {
    const user = userEvent.setup();

    render(
      <RadioCards
        disabled
        defaultValue="apple"
        name="fruit"
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ]}
      />
    );

    const [apple, banana] = getRadios();

    await user.click(banana);

    expect(apple.checked).toBe(true);
    expect(banana.checked).toBe(false);
  });

  it("respects disabled item", async () => {
    const user = userEvent.setup();

    render(
      <RadioCards
        defaultValue="apple"
        name="fruit"
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana", disabled: true },
        ]}
      />
    );

    const [apple, banana] = getRadios();

    await user.click(banana);

    expect(apple.checked).toBe(true);
    expect(banana.checked).toBe(false);
  });

  it("exposes data attributes", () => {
    render(
      <RadioCards
        defaultValue="apple"
        name="fruit"
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana", disabled: true },
        ]}
      />
    );

    const [appleItem, bananaItem] = getItems();

    expect(appleItem).toHaveAttribute("data-checked");
    expect(bananaItem).toHaveAttribute("data-disabled");
  });

  it("supports compound usage", async () => {
    const user = userEvent.setup();

    render(
      <RadioCards defaultValue="apple" name="fruit">
        <RadioCards.Item value="apple">
          <RadioCards.Indicator />
          <RadioCards.Label>Apple</RadioCards.Label>
        </RadioCards.Item>

        <RadioCards.Item value="banana">
          <RadioCards.Indicator />
          <RadioCards.Label>Banana</RadioCards.Label>
        </RadioCards.Item>
      </RadioCards>
    );

    const [apple, banana] = getRadios();

    expect(apple.checked).toBe(true);
    expect(banana.checked).toBe(false);

    await user.click(banana);

    expect(apple.checked).toBe(false);
    expect(banana.checked).toBe(true);
  });

  it("changes via keyboard (Enter)", async () => {
    const user = userEvent.setup();

    render(
      <RadioCards
        defaultValue="apple"
        name="fruit"
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ]}
      />
    );

    const [apple, banana] = getRadios();

    banana.focus();
    await user.keyboard("{Enter}");

    expect(apple.checked).toBe(false);
    expect(banana.checked).toBe(true);
  });

  it("changes via keyboard (Space)", async () => {
    const user = userEvent.setup();

    render(
      <RadioCards
        defaultValue="apple"
        name="fruit"
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ]}
      />
    );

    const [apple, banana] = getRadios();

    banana.focus();
    await user.keyboard(" ");

    expect(apple.checked).toBe(false);
    expect(banana.checked).toBe(true);
  });
});