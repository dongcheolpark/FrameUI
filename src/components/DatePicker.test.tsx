import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "./DatePicker";

afterEach(() => {
  cleanup();
});

function findDay(text: string): HTMLButtonElement {
  const buttons = screen.getAllByRole("button");
  const found = buttons.find((b) => {
    if (b.textContent !== text) return false;
    return b.getAttribute("data-ui") === "calendar-day";
  });
  if (!found) throw new Error(`day button "${text}" not found`);
  return found as HTMLButtonElement;
}

describe("DatePicker", () => {
  it("renders trigger with placeholder when no value is set", () => {
    render(<DatePicker.Root locale="en-US" />);
    expect(screen.getByRole("button", { name: /pick a date/i })).toBeInTheDocument();
  });

  it("opens the calendar when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<DatePicker.Root locale="en-US" defaultMonth={new Date(2026, 3, 1)} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: /pick a date/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("selecting a day updates the trigger label and closes the popover", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker.Root
        locale="en-US"
        defaultMonth={new Date(2026, 3, 1)}
        onValueChange={onChange}
      />
    );
    await user.click(screen.getByRole("button", { name: /pick a date/i }));
    await user.click(findDay("17"));
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0]![0] as Date;
    expect(arg.getDate()).toBe(17);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: /apr 17, 2026/i })).toBeInTheDocument();
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<DatePicker.Root locale="en-US" defaultMonth={new Date(2026, 3, 1)} />);
    await user.click(screen.getByRole("button", { name: /pick a date/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <DatePicker.Root locale="en-US" defaultMonth={new Date(2026, 3, 1)} />
        <button type="button">outside</button>
      </div>
    );
    await user.click(screen.getByRole("button", { name: /pick a date/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /outside/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("restores focus to the trigger after closing", async () => {
    const user = userEvent.setup();
    render(<DatePicker.Root locale="en-US" defaultMonth={new Date(2026, 3, 1)} />);
    const trigger = screen.getByRole("button", { name: /pick a date/i });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("controlled value updates the trigger label", () => {
    const { rerender } = render(
      <DatePicker.Root
        locale="en-US"
        value={new Date(2026, 3, 10)}
        defaultMonth={new Date(2026, 3, 1)}
      />
    );
    expect(screen.getByRole("button", { name: /apr 10, 2026/i })).toBeInTheDocument();
    rerender(
      <DatePicker.Root
        locale="en-US"
        value={new Date(2026, 4, 5)}
        defaultMonth={new Date(2026, 3, 1)}
      />
    );
    expect(screen.getByRole("button", { name: /may 5, 2026/i })).toBeInTheDocument();
  });

  it("trigger exposes aria-haspopup and aria-expanded", async () => {
    const user = userEvent.setup();
    render(<DatePicker.Root locale="en-US" defaultMonth={new Date(2026, 3, 1)} />);
    const trigger = screen.getByRole("button", { name: /pick a date/i });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
