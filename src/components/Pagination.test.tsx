import React, { useState } from "react";
import { describe, expect, it, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination, buildPaginationEntries } from "./Pagination";

afterEach(() => {
  cleanup();
});

describe("buildPaginationEntries", () => {
  it("renders all pages without ellipsis when total is small", () => {
    const entries = buildPaginationEntries(3, 5, 1, 1);
    expect(entries).toEqual([
      { type: "page", value: 1 },
      { type: "page", value: 2 },
      { type: "page", value: 3 },
      { type: "page", value: 4 },
      { type: "page", value: 5 },
    ]);
  });

  it("inserts ellipsis on the right when current page is near the start", () => {
    const entries = buildPaginationEntries(2, 20, 1, 1);
    const types = entries.map((e) => e.type);
    expect(types).toContain("ellipsis");
    expect(entries[0]).toEqual({ type: "page", value: 1 });
    expect(entries[entries.length - 1]).toEqual({ type: "page", value: 20 });
  });

  it("inserts ellipsis on both sides when current page is in the middle", () => {
    const entries = buildPaginationEntries(10, 20, 1, 1);
    const ellipses = entries.filter((e) => e.type === "ellipsis");
    expect(ellipses).toHaveLength(2);
    expect(entries.find((e) => e.type === "page" && e.value === 10)).toBeDefined();
  });

  it("collapses single-gap ellipsis into the actual page number", () => {
    const entries = buildPaginationEntries(4, 10, 1, 1);
    expect(entries.some((e) => e.type === "ellipsis")).toBe(true);
    expect(entries.some((e) => e.type === "page" && e.value === 3)).toBe(true);
  });

  it("returns empty list for non-positive totals", () => {
    expect(buildPaginationEntries(1, 0, 1, 1)).toEqual([]);
  });
});

describe("Pagination", () => {
  it("renders nav landmark with default aria-label", () => {
    render(
      <Pagination totalPages={5} defaultPage={1}>
        <Pagination.List />
      </Pagination>,
    );
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("marks the active page with aria-current=page", () => {
    render(
      <Pagination totalPages={5} defaultPage={3}>
        <Pagination.List />
      </Pagination>,
    );
    const active = screen.getByRole("button", { name: "3" });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(active).toHaveAttribute("data-state", "active");

    const inactive = screen.getByRole("button", { name: "1" });
    expect(inactive).not.toHaveAttribute("aria-current");
  });

  it("disables Prev/First on first page and Next/Last on last page", () => {
    const { rerender } = render(
      <Pagination totalPages={10} page={1}>
        <Pagination.First>First</Pagination.First>
        <Pagination.Prev>Prev</Pagination.Prev>
        <Pagination.Next>Next</Pagination.Next>
        <Pagination.Last>Last</Pagination.Last>
      </Pagination>,
    );

    expect(screen.getByRole("button", { name: "First" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Last" })).toBeEnabled();

    rerender(
      <Pagination totalPages={10} page={10}>
        <Pagination.First>First</Pagination.First>
        <Pagination.Prev>Prev</Pagination.Prev>
        <Pagination.Next>Next</Pagination.Next>
        <Pagination.Last>Last</Pagination.Last>
      </Pagination>,
    );

    expect(screen.getByRole("button", { name: "First" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Prev" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Last" })).toBeDisabled();
  });

  it("changes page in uncontrolled mode and fires onPageChange with 1-based number", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Pagination totalPages={5} defaultPage={1} onPageChange={handleChange}>
        <Pagination.List />
        <Pagination.Next>Next</Pagination.Next>
      </Pagination>,
    );

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(handleChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: "5" }));
    expect(handleChange).toHaveBeenLastCalledWith(5);
  });

  it("supports controlled mode", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function Controlled() {
      const [page, setPage] = useState(2);
      return (
        <Pagination
          page={page}
          totalPages={4}
          onPageChange={(next) => {
            handleChange(next);
            setPage(next);
          }}
        >
          <Pagination.List />
        </Pagination>
      );
    }

    render(<Controlled />);
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: "4" }));
    expect(handleChange).toHaveBeenCalledWith(4);
    expect(screen.getByRole("button", { name: "4" })).toHaveAttribute("aria-current", "page");
  });

  it("renders ellipsis with aria-hidden so screen readers skip it", () => {
    render(
      <Pagination totalPages={20} defaultPage={10}>
        <Pagination.List />
      </Pagination>,
    );

    const nav = screen.getByRole("navigation");
    const ellipses = within(nav).getAllByText("…");
    expect(ellipses.length).toBeGreaterThan(0);
    for (const node of ellipses) {
      expect(node).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("disables every interactive element when root is disabled", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Pagination totalPages={5} defaultPage={2} disabled onPageChange={handleChange}>
        <Pagination.Prev>Prev</Pagination.Prev>
        <Pagination.List />
        <Pagination.Next>Next</Pagination.Next>
      </Pagination>,
    );

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "3" }));
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("disables nav buttons when totalPages <= 1", () => {
    render(
      <Pagination totalPages={1}>
        <Pagination.First>First</Pagination.First>
        <Pagination.Prev>Prev</Pagination.Prev>
        <Pagination.Next>Next</Pagination.Next>
        <Pagination.Last>Last</Pagination.Last>
      </Pagination>,
    );

    for (const name of ["First", "Prev", "Next", "Last"]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
  });

  it("uses default aria-label for icon-only nav buttons", () => {
    render(
      <Pagination totalPages={5} defaultPage={3}>
        <Pagination.Prev>
          <svg aria-hidden="true" />
        </Pagination.Prev>
        <Pagination.Next>
          <svg aria-hidden="true" />
        </Pagination.Next>
      </Pagination>,
    );

    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeInTheDocument();
  });
});
