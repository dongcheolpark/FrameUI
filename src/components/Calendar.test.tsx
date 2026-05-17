import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "./Calendar";

afterEach(() => {
  cleanup();
});

function findDay(text: string, opts: { outside?: boolean } = {}): HTMLButtonElement {
  const buttons = screen.getAllByRole("button");
  const found = buttons.find((b) => {
    if (b.textContent !== text) return false;
    const state = b.getAttribute("data-state");
    return opts.outside ? state === "outside-month" : state !== "outside-month";
  });
  if (!found) throw new Error(`day button "${text}" not found`);
  return found as HTMLButtonElement;
}

describe("Calendar", () => {
  it("renders the month label for the visible month", () => {
    render(<Calendar.Root defaultMonth={new Date(2026, 3, 15)} locale="en-US" />);
    expect(screen.getByText(/April 2026/)).toBeInTheDocument();
  });

  it("renders 7 weekday headers and 42 day cells", () => {
    render(<Calendar.Root defaultMonth={new Date(2026, 3, 1)} locale="en-US" />);
    const grid = screen.getByRole("grid");
    expect(within(grid).getAllByRole("columnheader")).toHaveLength(7);
    expect(within(grid).getAllByRole("gridcell")).toHaveLength(42);
  });

  it("starts the week on the locale's first day", () => {
    render(<Calendar.Root defaultMonth={new Date(2026, 3, 1)} locale="en-GB" />);
    const grid = screen.getByRole("grid");
    const headers = within(grid).getAllByRole("columnheader");
    expect(headers[0]?.textContent).toMatch(/^M/i); // Monday
  });

  it("invokes onValueChange when a day is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Calendar.Root
        defaultMonth={new Date(2026, 3, 1)}
        onValueChange={onChange}
        locale="en-US"
      />
    );
    await user.click(findDay("15"));
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0]![0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(3);
    expect(arg.getDate()).toBe(15);
  });

  it("disables days before min and skips them on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Calendar.Root
        defaultMonth={new Date(2026, 3, 1)}
        min={new Date(2026, 3, 10)}
        onValueChange={onChange}
        locale="en-US"
      />
    );
    const five = findDay("5");
    expect(five).toBeDisabled();
    expect(five).toHaveAttribute("aria-disabled", "true");
    await user.click(five);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("changes month via Prev/Next buttons", async () => {
    const user = userEvent.setup();
    render(<Calendar.Root defaultMonth={new Date(2026, 3, 15)} locale="en-US" />);
    await user.click(screen.getByRole("button", { name: /next month/i }));
    expect(screen.getByText(/May 2026/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /previous month/i }));
    expect(screen.getByText(/April 2026/)).toBeInTheDocument();
  });

  it("ArrowRight moves focus forward by one day", async () => {
    const user = userEvent.setup();
    render(
      <Calendar.Root
        defaultMonth={new Date(2026, 3, 1)}
        defaultValue={new Date(2026, 3, 15)}
        locale="en-US"
      />
    );
    findDay("15").focus();
    await user.keyboard("{ArrowRight}");
    expect(findDay("16")).toHaveFocus();
  });

  it("PageDown advances to the next month", async () => {
    const user = userEvent.setup();
    render(
      <Calendar.Root
        defaultMonth={new Date(2026, 3, 1)}
        defaultValue={new Date(2026, 3, 15)}
        locale="en-US"
      />
    );
    findDay("15").focus();
    await user.keyboard("{PageDown}");
    expect(screen.getByText(/May 2026/)).toBeInTheDocument();
  });

  it("Enter selects the focused day", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Calendar.Root
        defaultMonth={new Date(2026, 3, 1)}
        defaultValue={new Date(2026, 3, 15)}
        onValueChange={onChange}
        locale="en-US"
      />
    );
    findDay("15").focus();
    await user.keyboard("{ArrowRight}{Enter}");
    const last = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as Date;
    expect(last.getDate()).toBe(16);
  });

  it("Home/End move within the focused week", async () => {
    const user = userEvent.setup();
    render(
      <Calendar.Root
        defaultMonth={new Date(2026, 3, 1)}
        defaultValue={new Date(2026, 3, 15)}
        locale="en-US"
      />
    );
    // April 15, 2026 is a Wednesday; with Sun-start week: Home=Sun (12), End=Sat (18).
    findDay("15").focus();
    await user.keyboard("{Home}");
    expect(findDay("12")).toHaveFocus();
    await user.keyboard("{End}");
    expect(findDay("18")).toHaveFocus();
  });

  it("respects controlled value updates", () => {
    const { rerender } = render(
      <Calendar.Root
        value={new Date(2026, 3, 10)}
        defaultMonth={new Date(2026, 3, 1)}
        locale="en-US"
      />
    );
    expect(findDay("10")).toHaveAttribute("data-state", "selected");
    rerender(
      <Calendar.Root
        value={new Date(2026, 3, 11)}
        defaultMonth={new Date(2026, 3, 1)}
        locale="en-US"
      />
    );
    expect(findDay("11")).toHaveAttribute("data-state", "selected");
  });

  it("marks today with aria-current", () => {
    const today = new Date();
    render(<Calendar.Root defaultMonth={today} locale="en-US" />);
    const todays = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-current") === "date");
    expect(todays.length).toBeGreaterThanOrEqual(1);
  });

  it("month label exposes aria-live", () => {
    const { container } = render(
      <Calendar.Root defaultMonth={new Date(2026, 3, 1)} locale="en-US" />
    );
    const label = container.querySelector('[data-ui="calendar-month-label"]');
    expect(label).not.toBeNull();
    expect(label).toHaveAttribute("aria-live", "polite");
    expect(label?.textContent).toMatch(/April 2026/);
  });
});
