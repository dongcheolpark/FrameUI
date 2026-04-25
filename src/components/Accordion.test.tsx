import React, { useState } from "react";
import { describe, expect, it, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "./Accordion";

afterEach(() => {
  cleanup();
});

describe("Accordion", () => {
  it("renders items with correct accessible attributes", () => {
    render(
      <Accordion.Root defaultValue="item-1">
        <Accordion.Item value="item-1">
          <Accordion.Header>
            <Accordion.Trigger>First</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>First content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Header>
            <Accordion.Trigger>Second</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Second content</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    );

    const firstTrigger = screen.getByRole("button", { name: "First" });
    const secondTrigger = screen.getByRole("button", { name: "Second" });

    expect(firstTrigger).toHaveAttribute("aria-expanded", "true");
    expect(secondTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("First content")).toBeVisible();
    expect(screen.getByText("Second content")).not.toBeVisible();
  });

  it("toggles single item and respects collapsible=false", async () => {
    const user = userEvent.setup();
    render(
      <Accordion.Root type="single" defaultValue="item-1" collapsible={false}>
        <Accordion.Item value="item-1">
          <Accordion.Header>
            <Accordion.Trigger>First</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>First content</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    );

    const trigger = screen.getByRole("button", { name: "First" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("First content")).toBeVisible();
  });

  it("allows multiple items to open when type=multiple", async () => {
    const user = userEvent.setup();
    render(
      <Accordion.Root type="multiple" defaultValue={["item-1"]}>
        <Accordion.Item value="item-1">
          <Accordion.Header>
            <Accordion.Trigger>First</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>First content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Header>
            <Accordion.Trigger>Second</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Second content</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    );

    await user.click(screen.getByRole("button", { name: "Second" }));

    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("First content")).toBeVisible();
    expect(screen.getByText("Second content")).toBeVisible();
  });

  it("supports keyboard navigation with Arrow keys and Home/End", async () => {
    const user = userEvent.setup();
    render(
      <Accordion.Root type="multiple">
        <Accordion.Item value="item-1">
          <Accordion.Header>
            <Accordion.Trigger>First</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>First content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Header>
            <Accordion.Trigger>Second</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Second content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-3">
          <Accordion.Header>
            <Accordion.Trigger>Third</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Third content</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    );

    const [first, second, third] = screen.getAllByRole("button");
    expect(first).toBeDefined();
    first?.focus();
    expect(first).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(second).toHaveFocus();

    await user.keyboard("{End}");
    expect(third).toHaveFocus();

    await user.keyboard("{Home}");
    expect(first).toHaveFocus();
  });

  it("respects disabled root state", async () => {
    const user = userEvent.setup();
    render(
      <Accordion.Root disabled defaultValue="item-1">
        <Accordion.Item value="item-1">
          <Accordion.Header>
            <Accordion.Trigger>First</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>First content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Header>
            <Accordion.Trigger>Second</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Second content</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    );

    await user.click(screen.getByRole("button", { name: "Second" }));
    expect(screen.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "false");
  });

  it("supports controlled mode", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function ControlledAccordion() {
      const [value, setValue] = useState("item-1");
      return (
        <Accordion.Root value={value} onValueChange={(next) => { setValue(next as string); handleChange(next); }}>
          <Accordion.Item value="item-1">
            <Accordion.Header>
              <Accordion.Trigger>First</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>First content</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item-2">
            <Accordion.Header>
              <Accordion.Trigger>Second</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Second content</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      );
    }

    render(<ControlledAccordion />);
    await user.click(screen.getByRole("button", { name: "Second" }));

    expect(handleChange).toHaveBeenCalledWith("item-2");
    expect(screen.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "true");
  });
});
