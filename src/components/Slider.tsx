import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step"
>;

export interface SliderProps extends NativeInputProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
}

export function Slider({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  disabled = false,
  ...props
}: SliderProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;

  const currentValue = useMemo(
    () => (isControlled ? (value as number) : uncontrolledValue),
    [isControlled, uncontrolledValue, value],
  );

  const percent = useMemo(() => {
    if (max === min) {
      return 0;
    }

    const ratio = (currentValue - min) / (max - min);
    return Math.min(Math.max(ratio, 0), 1) * 100;
  }, [currentValue, max, min]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }

      const nextValue = Number(event.target.value);

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [disabled, isControlled, onValueChange],
  );

  return (
    <label
      data-ui="slider"
      data-disabled={disabled ? "" : undefined}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: "100%",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        disabled={disabled}
        onChange={handleChange}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentValue}
        style={{ width: "100%" }}
        {...props}
      />
      <div className="track" data-percent={percent} />
    </label>
  );
}
