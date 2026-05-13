import { useCallback, useMemo, useState } from "react";
import type { InputHTMLAttributes } from "react";

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "onChange" | "type"
>;

export interface SwitchProps extends NativeInputProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  ...props
}: SwitchProps) {
  const [uncontrolledChecked, setUncontrolledChecked] =
    useState(defaultChecked);
  const isControlled = checked !== undefined;

  const currentChecked = useMemo(
    () => (isControlled ? checked : uncontrolledChecked),
    [checked, isControlled, uncontrolledChecked],
  );

  const toggleChecked = useCallback(() => {
    if (disabled) {
      return;
    }

    const nextChecked = !currentChecked;

    if (!isControlled) {
      setUncontrolledChecked(nextChecked);
    }

    onCheckedChange?.(nextChecked);
  }, [currentChecked, disabled, isControlled, onCheckedChange]);

  return (
    <label
      data-ui="switch"
      data-state={currentChecked ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <input
        type="checkbox"
        checked={currentChecked}
        disabled={disabled}
        onChange={toggleChecked}
        style={{
          position: "absolute",
          left: "-9999px",
        }}
        {...props}
      />
      <div className="handle" />
    </label>
  );
}
