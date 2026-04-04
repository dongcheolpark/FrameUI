import { useCallback, useMemo, useState } from "react";
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "onChange" | "type" | "value"
>;

export interface CheckboxCardOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface CheckboxCardsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  options: CheckboxCardOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  orientation?: "vertical" | "horizontal";
  inputProps?: NativeInputProps;
}

export function CheckboxCards({
  options,
  value,
  defaultValue = [],
  onValueChange,
  disabled = false,
  name,
  required = false,
  orientation = "vertical",
  inputProps,
  ...props
}: CheckboxCardsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(
    defaultValue,
  );

  const isControlled = value !== undefined;

  const currentValue = useMemo(
    () => (isControlled ? value : uncontrolledValue),
    [isControlled, uncontrolledValue, value],
  );

  const toggleValue = useCallback(
    (optionValue: string, optionDisabled?: boolean) => {
      if (disabled || optionDisabled) {
        return;
      }

      const nextValue = currentValue.includes(optionValue)
        ? currentValue.filter((item) => item !== optionValue)
        : [...currentValue, optionValue];

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [currentValue, disabled, isControlled, onValueChange],
  );

  return (
    <div
      data-component="checkbox-cards"
      data-orientation={orientation}
      data-disabled={disabled ? "" : undefined}
      {...props}
    >
      {options.map((option) => {
        const checked = currentValue.includes(option.value);
        const optionDisabled = disabled || option.disabled;

        return (
          <label
            key={option.value}
            data-component="checkbox-card"
            data-state={checked ? "checked" : "unchecked"}
            data-disabled={optionDisabled ? "" : undefined}
            style={{ cursor: optionDisabled ? "not-allowed" : "pointer" }}
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={checked}
              disabled={optionDisabled}
              required={required}
              onChange={() => toggleValue(option.value, option.disabled)}
              style={{
                position: "absolute",
                left: "-9999px",
              }}
              {...inputProps}
            />
            <div>
              <div>{option.label}</div>
              {option.description ? <div>{option.description}</div> : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}