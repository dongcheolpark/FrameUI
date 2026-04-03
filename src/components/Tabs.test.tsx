import React, { useState } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";

afterEach(() => {
  cleanup();
});

describe("Tabs", () => {
  it("renders with basic structure", () => {
    render(
      <Tabs.Root defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
        <Tabs.Content value="tab2">Content 2</Tabs.Content>
      </Tabs.Root>
    );

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");

    expect(screen.getByText("Content 1")).toBeVisible();
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
  });

  it("changes tab on click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs.Root defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
        <Tabs.Content value="tab2">Content 2</Tabs.Content>
      </Tabs.Root>
    );

    await user.click(screen.getByText("Tab 2"));

    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeVisible();

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  });

  it("supports controlled mode", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    function ControlledTabs() {
      const [val, setVal] = useState("tab1");
      return (
        <Tabs.Root value={val} onValueChange={(v) => { setVal(v); handleChange(v); }}>
          <Tabs.List>
            <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
            <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tab1">Content 1</Tabs.Content>
          <Tabs.Content value="tab2">Content 2</Tabs.Content>
        </Tabs.Root>
      );
    }

    render(<ControlledTabs />);

    await user.click(screen.getByText("Tab 2"));
    expect(handleChange).toHaveBeenCalledWith("tab2");
    expect(screen.getByText("Content 2")).toBeVisible();
  });

  it("handles keyboard navigation (manual mode by default)", async () => {
    const user = userEvent.setup();
    render(
      <Tabs.Root defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
        <Tabs.Content value="tab2">Content 2</Tabs.Content>
        <Tabs.Content value="tab3">Content 3</Tabs.Content>
      </Tabs.Root>
    );

    const tabs = screen.getAllByRole("tab");
    
    // Focus first tab
    tabs[0]!.focus();
    expect(tabs[0]).toHaveFocus();

    // ArrowRight to move to next tab without activating
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    // In manual mode, the content shouldn't change just by arrowing
    expect(screen.getByText("Content 1")).toBeVisible();
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();

    // Type Enter to activate Tab 2
    await user.keyboard("{Enter}");
    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeVisible();

    // ArrowLeft
    await user.keyboard("{ArrowLeft}");
    expect(tabs[0]).toHaveFocus();

    // End key
    await user.keyboard("{End}");
    expect(tabs[2]).toHaveFocus();

    // Home key
    await user.keyboard("{Home}");
    expect(tabs[0]).toHaveFocus();
  });

  it("handles keyboard navigation (automatic mode)", async () => {
    const user = userEvent.setup();
    render(
      <Tabs.Root defaultValue="tab1" activationMode="automatic">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
        <Tabs.Content value="tab2">Content 2</Tabs.Content>
      </Tabs.Root>
    );

    const tabs = screen.getAllByRole("tab");
    tabs[0]!.focus();

    // In automatic mode, arrowing should change focus AND activation
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    expect(screen.getByText("Content 2")).toBeVisible();
    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
  });

  it("ignores disabled tabs during navigation", async () => {
    const user = userEvent.setup();
    render(
      <Tabs.Root defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2" disabled>Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
        <Tabs.Content value="tab2">Content 2</Tabs.Content>
        <Tabs.Content value="tab3">Content 3</Tabs.Content>
      </Tabs.Root>
    );

    const tabs = screen.getAllByRole("tab");
    tabs[0]!.focus();

    // ArrowRight should skip tab2 and go to tab3
    await user.keyboard("{ArrowRight}");
    expect(tabs[2]).toHaveFocus();

    // ArrowLeft should skip tab2 and go back to tab1
    await user.keyboard("{ArrowLeft}");
    expect(tabs[0]).toHaveFocus();
    
    // Clicking disabled tab should do nothing
    await user.click(tabs[1]!);
    expect(screen.getByText("Content 1")).toBeVisible();
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
  });
});
