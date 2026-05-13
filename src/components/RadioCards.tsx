import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import type {
  InputHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";

// --- Types ---
export interface RadioCardOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioCardsRootProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  children?: ReactNode;
}

export interface RadioCardsItemProps extends HTMLAttributes<HTMLLabelElement> {
  value: string;
  disabled?: boolean | undefined;
  children?: ReactNode;
}

export type RadioCardsIndicatorProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export interface RadioCardsLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface RadioCardsDescriptionProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface RadioCardsProps extends RadioCardsRootProps {
  options?: RadioCardOption[];
}

// --- Context ---
interface RadioCardsContextValue {
  selectedValue: string | undefined;
  selectValue: (value: string) => void;
  disabled: boolean;
  invalid: boolean;
  name: string | undefined;
}

const RadioCardsContext = createContext<RadioCardsContextValue | null>(null);

const RadioCardsItemContext = createContext<{
  value: string;
  checked: boolean;
  disabled: boolean;
} | null>(null);

export function useRadioCardsContext() {
  return useContext(RadioCardsContext);
}

export function useRadioCardsItemContext() {
  return useContext(RadioCardsItemContext);
}

// --- Components ---
export function RadioCardsRoot({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  invalid = false,
  name,
  children,
  style,
  ...props
}: RadioCardsRootProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(
    defaultValue
  );

  const isControlled = value !== undefined;

  const selectedValue = useMemo(
    () => (isControlled ? value : uncontrolledValue),
    [isControlled, value, uncontrolledValue]
  );

  const selectValue = useCallback(
    (itemValue: string) => {
      if (selectedValue === itemValue) return;

      if (!isControlled) {
        setUncontrolledValue(itemValue);
      }

      onValueChange?.(itemValue);
    },
    [isControlled, onValueChange, selectedValue]
  );

  return (
    <RadioCardsContext.Provider
      value={{ selectedValue, selectValue, disabled, invalid, name }}
    >
      <div
        role="radiogroup"
        data-ui="radio-cards"
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        style={{ display: "flex", flexDirection: "column", gap: "8px", ...style }}
        {...props}
      >
        {children}
      </div>
    </RadioCardsContext.Provider>
  );
}

export function RadioCardsItem({
  value,
  disabled: itemDisabled = false,
  children,
  style,
  onClick,
  ...props
}: RadioCardsItemProps) {
  const ctx = useContext(RadioCardsContext);

  if (!ctx) {
    throw new Error("RadioCardsItem must be used inside RadioCardsRoot");
  }

  const { selectedValue, disabled: rootDisabled } = ctx;
  const disabled = rootDisabled || itemDisabled;
  const checked = selectedValue === value;

  const handleClick = (e: MouseEvent<HTMLLabelElement>) => {
    onClick?.(e);

    if (e.defaultPrevented) return;

    if (disabled) {
      e.preventDefault();
    }
  };

  return (
    <RadioCardsItemContext.Provider value={{ value, checked, disabled }}>
      <label
        data-ui="radio-cards-item"
        data-checked={checked ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          cursor: disabled ? "not-allowed" : "pointer",
          ...style,
        }}
        onClick={handleClick}
        {...props}
      >
        {children}
      </label>
    </RadioCardsItemContext.Provider>
  );
}

export function RadioCardsIndicator({
  style,
  onChange,
  onKeyDown,
  ...props
}: RadioCardsIndicatorProps) {
  const ctx = useContext(RadioCardsContext);
  const itemCtx = useContext(RadioCardsItemContext);

  if (!ctx || !itemCtx) {
    throw new Error("RadioCardsIndicator must be used inside RadioCardsItem");
  }

  const { selectValue, name } = ctx;
  const { value, checked, disabled } = itemCtx;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);

    if (!disabled) {
      selectValue(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);

    if (e.defaultPrevented || disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectValue(value);
    }
  };

  return (
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      data-ui="radio-cards-indicator"
      style={{ flexShrink: 0, ...style }}
      {...props}
    />
  );
}

export function RadioCardsLabel({ children, ...props }: RadioCardsLabelProps) {
  return (
    <span data-ui="radio-cards-label" {...props}>
      {children}
    </span>
  );
}

export function RadioCardsDescription({
  children,
  ...props
}: RadioCardsDescriptionProps) {
  return (
    <span data-ui="radio-cards-description" {...props}>
      {children}
    </span>
  );
}

// --- Default Component ---
export const RadioCards = Object.assign(
  function RadioCards({ options, children, ...rootProps }: RadioCardsProps) {
    if (options) {
      return (
        <RadioCardsRoot {...rootProps}>
          {options.map((option) => (
            <RadioCardsItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              <RadioCardsIndicator />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <RadioCardsLabel>{option.label}</RadioCardsLabel>
                {option.description && (
                  <RadioCardsDescription>{option.description}</RadioCardsDescription>
                )}
              </div>
            </RadioCardsItem>
          ))}
        </RadioCardsRoot>
      );
    }

    return <RadioCardsRoot {...rootProps}>{children}</RadioCardsRoot>;
  },
  {
    Root: RadioCardsRoot,
    Item: RadioCardsItem,
    Indicator: RadioCardsIndicator,
    Label: RadioCardsLabel,
    Description: RadioCardsDescription,
  }
);