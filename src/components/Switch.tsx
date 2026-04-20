import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

// --- Types ---
type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "onChange" | "type"
>;

export interface SwitchRootProps extends NativeInputProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children?: ReactNode;
}

export type SwitchProps = SwitchRootProps;

export interface SwitchThumbProps extends HTMLAttributes<HTMLDivElement> {}

// --- Context ---
interface SwitchContextValue {
  checked: boolean;
  disabled: boolean;
}

const SwitchContext = createContext<SwitchContextValue | null>(null);

export function useSwitchContext() {
  return useContext(SwitchContext);
}

// --- Components ---
export function SwitchRoot({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  children,
  ...props
}: SwitchRootProps) {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
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
    <SwitchContext.Provider value={{ checked: currentChecked, disabled }}>
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
        {children ?? <SwitchThumb />}
      </label>
    </SwitchContext.Provider>
  );
}

export function SwitchThumb({ className, ...props }: SwitchThumbProps) {
  const merged = className ? `handle ${className}` : "handle";
  return <div data-ui="switch-thumb" className={merged} {...props} />;
}

export const Switch = Object.assign(
  function Switch(props: SwitchProps) {
    return <SwitchRoot {...props} />;
  },
  {
    Root: SwitchRoot,
    Thumb: SwitchThumb,
  },
);
