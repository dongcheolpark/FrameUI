import React, { useMemo, useState, createContext, useContext, useCallback, useId } from "react";
import type { HTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type AccordionType = "single" | "multiple";

export interface AccordionRootProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  type?: AccordionType;
  collapsible?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  disabled?: boolean;
  loop?: boolean;
  children?: ReactNode;
}

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "value"> {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

export interface AccordionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

interface AccordionContextValue {
  type: AccordionType;
  openKeys: string[];
  onToggle: (value: string) => void;
  disabled: boolean;
  loop: boolean;
  collapsible: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion.Root");
  }
  return context;
}

interface AccordionItemContextValue {
  value: string;
  disabled: boolean;
  isOpen: boolean;
  onToggle: () => void;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error("Accordion.Trigger and Accordion.Content must be used within an Accordion.Item");
  }
  return context;
}

export function AccordionRoot({
  type = "single",
  collapsible = false,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  loop = true,
  children,
  className,
  ref,
  ...props
}: AccordionRootProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string | string[] | undefined>(defaultValue);
  const isControlled = value !== undefined;

  const currentValue = useMemo(
    () => (isControlled ? value : uncontrolledValue),
    [isControlled, uncontrolledValue, value],
  );

  const openKeys = useMemo<string[]>(() => {
    if (type === "multiple") {
      if (Array.isArray(currentValue)) {
        return currentValue;
      }
      return typeof currentValue === "string" && currentValue !== "" ? [currentValue] : [];
    }

    return typeof currentValue === "string" && currentValue !== "" ? [currentValue] : [];
  }, [currentValue, type]);

  const setValue = useCallback(
    (nextValue: string | string[]) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const onToggle = useCallback(
    (itemValue: string) => {
      if (disabled) {
        return;
      }

      const isOpen = openKeys.includes(itemValue);
      let nextValue: string | string[];

      if (type === "multiple") {
        nextValue = isOpen ? openKeys.filter((key) => key !== itemValue) : [...openKeys, itemValue];
      } else {
        if (isOpen) {
          nextValue = collapsible ? "" : (currentValue as string) || "";
        } else {
          nextValue = itemValue;
        }
      }

      setValue(nextValue);
    },
    [collapsible, currentValue, disabled, openKeys, setValue, type],
  );

  return (
    <AccordionContext.Provider
      value={{
        type,
        openKeys,
        onToggle,
        disabled,
        loop,
        collapsible,
      }}
    >
      <div
        ref={ref}
        data-ui="accordion"
        data-type={type}
        data-disabled={disabled ? "" : undefined}
        className={className}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  disabled = false,
  children,
  className,
  ...props
}: AccordionItemProps) {
  const { openKeys, onToggle, disabled: rootDisabled } = useAccordionContext();
  const isOpen = openKeys.includes(value);
  const itemId = useId();
  const triggerId = `accordion-trigger-${itemId}`;
  const contentId = `accordion-content-${itemId}`;

  const contextValue = useMemo(
    () => ({
      value,
      disabled,
      isOpen,
      onToggle: () => onToggle(value),
      triggerId,
      contentId,
    }),
    [contentId, disabled, isOpen, onToggle, triggerId, value],
  );

  return (
    <AccordionItemContext.Provider value={contextValue}>
      <div
        data-ui="accordion-item"
        data-state={isOpen ? "open" : "closed"}
        data-disabled={disabled || rootDisabled ? "" : undefined}
        data-value={value}
        className={className}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionHeader({ children, className, ...props }: AccordionHeaderProps) {
  return (
    <div data-ui="accordion-header" className={className} {...props}>
      {children}
    </div>
  );
}

export function AccordionTrigger({
  children,
  onClick,
  onKeyDown,
  className,
  ...props
}: AccordionTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { disabled, isOpen, onToggle, triggerId, contentId } = useAccordionItemContext();
  const rootContext = useAccordionContext();
  const isDisabled = disabled || rootContext.disabled;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isDisabled) {
      return;
    }
    onToggle();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }

    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) {
      return;
    }

    const rootElement = event.currentTarget.closest<HTMLElement>('[data-ui="accordion"]');
    if (!rootElement) {
      return;
    }

    const triggers = Array.from(
      rootElement.querySelectorAll<HTMLButtonElement>('[data-ui="accordion-trigger"]:not([disabled])'),
    );
    const currentIndex = triggers.findIndex((trigger) => trigger === event.currentTarget);
    if (currentIndex === -1) {
      return;
    }

    let nextIndex = currentIndex;
    switch (event.key) {
      case "ArrowDown":
        nextIndex = currentIndex + 1;
        break;
      case "ArrowUp":
        nextIndex = currentIndex - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = triggers.length - 1;
        break;
    }

    if (nextIndex < 0) {
      nextIndex = rootContext.loop ? triggers.length - 1 : 0;
    }
    if (nextIndex >= triggers.length) {
      nextIndex = rootContext.loop ? 0 : triggers.length - 1;
    }

    if (nextIndex === currentIndex) {
      return;
    }

    event.preventDefault();
    triggers[nextIndex]?.focus();
  };

  return (
    <button
      type="button"
      id={triggerId}
      aria-expanded={isOpen}
      aria-controls={contentId}
      aria-disabled={isDisabled ? "true" : undefined}
      data-ui="accordion-trigger"
      data-state={isOpen ? "open" : "closed"}
      data-disabled={isDisabled ? "" : undefined}
      disabled={isDisabled}
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </button>
  );
}

export function AccordionContent({
  children,
  className,
  ...props
}: AccordionContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { isOpen, contentId, triggerId } = useAccordionItemContext();

  return (
    <div
      ref={props.ref}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      aria-hidden={!isOpen}
      data-ui="accordion-content"
      data-state={isOpen ? "open" : "closed"}
      hidden={!isOpen}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

export const Accordion = Object.assign(
  function Accordion(props: AccordionRootProps & { ref?: React.Ref<HTMLDivElement> }) {
    return <AccordionRoot {...props} />;
  },
  {
    Root: AccordionRoot,
    Item: AccordionItem,
    Header: AccordionHeader,
    Trigger: AccordionTrigger,
    Content: AccordionContent,
  },
);
