import React, { useMemo, useState, createContext, useContext } from "react";
import type { HTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

// --- Types ---
export interface TabsRootProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  activationMode?: "automatic" | "manual";
  children?: ReactNode;
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface TabsTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

// --- Context ---
const TabsContext = createContext<{
  value: string | undefined;
  onValueChange: (value: string) => void;
  orientation: "horizontal" | "vertical";
  activationMode: "automatic" | "manual";
} | null>(null);

export function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs.Root");
  }
  return context;
}

// --- Components ---
export function TabsRoot({
  value,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  activationMode = "manual",
  children,
  className,
  ref,
  ...props
}: TabsRootProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;

  const currentValue = useMemo(
    () => (isControlled ? value : uncontrolledValue),
    [isControlled, uncontrolledValue, value]
  );

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        orientation,
        activationMode,
      }}
    >
      <div
        ref={ref}
        data-orientation={orientation}
        className={className}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  onKeyDown,
  ref,
  ...props
}: TabsListProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { orientation, activationMode, onValueChange } = useTabsContext();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const container = event.currentTarget;
    const tabs = Array.from(
      container.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])')
    );

    if (!tabs.length) return;

    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    const isHorizontal = orientation === "horizontal";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

    switch (event.key) {
      case nextKey:
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case prevKey:
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return; // Unhandled key
    }

    event.preventDefault();
    const nextTab = tabs[nextIndex] as HTMLElement;
    nextTab.focus();

    if (activationMode === "automatic") {
      const nextValue = nextTab.getAttribute("data-value");
      if (nextValue) {
        onValueChange(nextValue);
      }
    }
  };

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      data-orientation={orientation}
      className={className}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  disabled = false,
  onClick,
  onFocus,
  children,
  className,
  ref,
  ...props
}: TabsTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isSelected = selectedValue === value;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    onValueChange(value);
  };

  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    onFocus?.(event);
    // Focus handles selection if manual mode isn't checked here?
    // Wait, automatic mode is handled by keydown in TabsList because focus can happen 
    // simply by clicking (which is handled by handleClick) or by Tab key (which we don't intercept).
    // If we want automatic selection purely on focus, we could check activationMode here,
    // but React's synthetic focus fires on clicks too. Doing it in TabsList onKeyDown is safer to avoid click-focus double-firing.
  };

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      data-state={isSelected ? "active" : "inactive"}
      data-disabled={disabled ? "" : undefined}
      data-value={value}
      disabled={disabled}
      tabIndex={isSelected ? 0 : -1}
      onClick={handleClick}
      onFocus={handleFocus}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  forceMount,
  children,
  className,
  ref,
  ...props
}: TabsContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;

  if (!isSelected && !forceMount) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`} // Optional: Should match trigger ID if we generated one
      data-state={isSelected ? "active" : "inactive"}
      hidden={!isSelected} /* Applies when forceMount is true but not selected */
      tabIndex={0}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
};
