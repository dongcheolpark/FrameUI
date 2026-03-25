import { useCallback, useMemo, useState } from "react";
import type { ButtonHTMLAttributes } from "react";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "checked" | "defaultChecked" | "onChange"
>;

export interface SwitchProps extends NativeButtonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  type,
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
    <button
      type={type ?? "button"}
      role="switch"
      aria-checked={currentChecked}
      aria-disabled={disabled || undefined}
      data-state={currentChecked ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      onClick={toggleChecked}
      {...props}
    />
  );
}
