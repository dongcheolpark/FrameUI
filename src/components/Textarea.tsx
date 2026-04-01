import { useMemo, useState } from "react";
import type {
  ChangeEvent,
  KeyboardEvent,
  TextareaHTMLAttributes,
} from "react";

type NativeTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue"
>;

export interface TextareaProps extends NativeTextareaProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  minRows?: number;
  maxRows?: number;
  enterKeyBehavior?: "newline" | "submit";
  onSubmitEnter?: (
    value: string,
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => void;
  invalid?: boolean;
}

export function Textarea({
  value,
  defaultValue = "",
  onValueChange,
  minRows = 1,
  maxRows,
  enterKeyBehavior = "newline",
  onSubmitEnter,
  disabled = false,
  readOnly = false,
  invalid = false,
  onChange,
  onKeyDown,
  style,
  ...props
}: TextareaProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;

  const currentValue = useMemo(
    () => (isControlled ? value : uncontrolledValue),
    [isControlled, uncontrolledValue, value],
  );

  const lineCount = useMemo(() => {
    const safeValue = currentValue.length > 0 ? currentValue : "";
    return safeValue.split("\n").length;
  }, [currentValue]);

  const normalizedMinRows = Math.max(minRows, 1);
  const normalizedMaxRows =
    maxRows !== undefined ? Math.max(maxRows, normalizedMinRows) : undefined;

  const computedRows = normalizedMaxRows
    ? Math.min(Math.max(lineCount, normalizedMinRows), normalizedMaxRows)
    : Math.max(lineCount, normalizedMinRows);

  const isOverflow = normalizedMaxRows ? lineCount > normalizedMaxRows : false;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;

    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
    onChange?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    if (event.nativeEvent.isComposing) {
      return;
    }

    if (enterKeyBehavior === "submit" && !event.shiftKey && !disabled && !readOnly) {
      event.preventDefault();
      onSubmitEnter?.(currentValue, event);
    }
  };

  const ariaInvalid = invalid || props["aria-invalid"] ? true : undefined;

  return (
    <textarea
      value={currentValue}
      rows={computedRows}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={ariaInvalid}
      data-disabled={disabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-overflow={isOverflow ? "" : undefined}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      style={{
        overflowY: isOverflow ? "auto" : "hidden",
        ...style,
      }}
      {...props}
    />
  );
}
