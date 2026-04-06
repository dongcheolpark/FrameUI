import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import type {
  HTMLAttributes,
  ReactNode,
  ChangeEvent,
} from "react";

// --- Types ---
export interface CheckboxCardOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface CheckboxCardsRootProps extends HTMLAttributes<HTMLDivElement> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  invalid?: boolean;
  children?: ReactNode;
}

export interface CheckboxCardsItemProps extends HTMLAttributes<HTMLLabelElement> {
  value: string;
  disabled?: boolean | undefined;
  children?: ReactNode;
}

export interface CheckboxCardsIndicatorProps extends HTMLAttributes<HTMLInputElement> {}

export interface CheckboxCardsLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface CheckboxCardsDescriptionProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface CheckboxCardsProps extends CheckboxCardsRootProps {
  options?: CheckboxCardOption[];
}

// --- Context ---
interface CheckboxCardsContextValue {
  selectedValues: string[];
  toggleValue: (value: string) => void;
  disabled: boolean;
  invalid: boolean;
}

const CheckboxCardsContext = createContext<CheckboxCardsContextValue | null>(null);

const CheckboxCardsItemContext = createContext<{
  value: string;
  checked: boolean;
  disabled: boolean;
} | null>(null);

export function useCheckboxCardsContext() {
  return useContext(CheckboxCardsContext);
}

export function useCheckboxCardsItemContext() {
  return useContext(CheckboxCardsItemContext);
}

// --- Components ---
export function CheckboxCardsRoot({
  value,
  defaultValue = [],
  onValueChange,
  disabled = false,
  invalid = false,
  children,
  style,
  ...props
}: CheckboxCardsRootProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue);
  const isControlled = value !== undefined;

  const selectedValues = useMemo(
    () => (isControlled ? value : uncontrolledValue),
    [isControlled, value, uncontrolledValue]
  );

  const toggleValue = useCallback(
    (itemValue: string) => {
      const next = selectedValues.includes(itemValue)
        ? selectedValues.filter((v) => v !== itemValue)
        : [...selectedValues, itemValue];

      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [selectedValues, isControlled, onValueChange]
  );

  return (
    <CheckboxCardsContext.Provider value={{ selectedValues, toggleValue, disabled, invalid }}>
      <div
        data-ui="checkbox-cards"
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        style={{ display: "flex", flexDirection: "column", gap: "8px", ...style }}
        {...props}
      >
        {children}
      </div>
    </CheckboxCardsContext.Provider>
  );
}

export function CheckboxCardsItem({
  value,
  disabled: itemDisabled = false,
  children,
  style,
  ...props
}: CheckboxCardsItemProps) {
  const ctx = useContext(CheckboxCardsContext);
  if (!ctx) throw new Error("CheckboxCardsItem must be used inside CheckboxCardsRoot");

  const { selectedValues, toggleValue, disabled: rootDisabled } = ctx;
  const disabled = rootDisabled || itemDisabled;
  const checked = selectedValues.includes(value);

  return (
    <CheckboxCardsItemContext.Provider value={{ value, checked, disabled }}>
      <label
        data-ui="checkbox-cards-item"
        data-checked={checked ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: disabled ? "not-allowed" : "pointer", ...style }}
        {...props}
      >
        {children}
      </label>
    </CheckboxCardsItemContext.Provider>
  );
}

export function CheckboxCardsIndicator({
  style,
  ...props
}: CheckboxCardsIndicatorProps) {
  const ctx = useContext(CheckboxCardsContext);
  const itemCtx = useContext(CheckboxCardsItemContext);
  if (!ctx || !itemCtx) throw new Error("CheckboxCardsIndicator must be used inside CheckboxCardsItem");

  const { toggleValue } = ctx;
  const { value, checked, disabled } = itemCtx;

  const handleChange = (_e: ChangeEvent<HTMLInputElement>) => {
    if (!disabled) toggleValue(value);
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={handleChange}
      data-ui="checkbox-cards-indicator"
      style={{ flexShrink: 0, ...style }}
      {...props}
    />
  );
}

export function CheckboxCardsLabel({ children, ...props }: CheckboxCardsLabelProps) {
  return (
    <span data-ui="checkbox-cards-label" {...props}>
      {children}
    </span>
  );
}

export function CheckboxCardsDescription({ children, ...props }: CheckboxCardsDescriptionProps) {
  return (
    <span data-ui="checkbox-cards-description" {...props}>
      {children}
    </span>
  );
}

// --- Default Component ---
export const CheckboxCards = Object.assign(
  function CheckboxCards({ options, children, ...rootProps }: CheckboxCardsProps) {
    if (options) {
      return (
        <CheckboxCardsRoot {...rootProps}>
          {options.map((option) => (
            <CheckboxCardsItem key={option.value} value={option.value} disabled={option.disabled}>
              <CheckboxCardsIndicator />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <CheckboxCardsLabel>{option.label}</CheckboxCardsLabel>
                {option.description && (
                  <CheckboxCardsDescription>{option.description}</CheckboxCardsDescription>
                )}
              </div>
            </CheckboxCardsItem>
          ))}
        </CheckboxCardsRoot>
      );
    }

    return <CheckboxCardsRoot {...rootProps}>{children}</CheckboxCardsRoot>;
  },
  {
    Root: CheckboxCardsRoot,
    Item: CheckboxCardsItem,
    Indicator: CheckboxCardsIndicator,
    Label: CheckboxCardsLabel,
    Description: CheckboxCardsDescription,
  }
);