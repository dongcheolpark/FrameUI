import { useMemo, useState, createContext, useContext } from "react";
import type { ChangeEvent, KeyboardEvent, TextareaHTMLAttributes, HTMLAttributes, ReactNode } from "react";

// --- Types ---
export type NativeTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue"
>;

export interface TextareaInputProps extends NativeTextareaProps {
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

export interface TextareaRootProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface TextareaActionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

// --- Context ---
const TextareaContext = createContext<{
  isOverflow: boolean;
  invalid: boolean;
  disabled: boolean;
  readOnly: boolean;
} | null>(null);

export function useTextareaContext() {
  return useContext(TextareaContext);
}

// --- Components ---
export function TextareaRoot({ children, className, style, ...props }: TextareaRootProps) {
  return (
    <div
      data-ui="textarea-wrapper"
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-end", // Push action to bottom
        gap: "8px", 
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function TextareaInput({
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
  ref, // React 19 forwardRef 대체
  ...props
}: TextareaInputProps & { ref?: React.Ref<HTMLTextAreaElement> }) {
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

    if (
      enterKeyBehavior === "submit" &&
      !event.shiftKey &&
      !disabled &&
      !readOnly
    ) {
      event.preventDefault();
      onSubmitEnter?.(currentValue, event);
    }
  };

  const ariaInvalid = invalid || props["aria-invalid"] ? true : undefined;

  return (
    <TextareaContext.Provider value={{ isOverflow, invalid, disabled, readOnly }}>
      <textarea
        ref={ref}
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
          flex: 1, // Full width in flex container
          overflowY: isOverflow ? "auto" : "hidden",
          ...style,
        }}
        {...props}
      />
    </TextareaContext.Provider>
  );
}

export function TextareaAction({ children, className, ...props }: TextareaActionProps) {
  return (
    <div
      data-ui="textarea-action"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

// Default Component for backward compatibility and quick usage
export function TextareaPrimitive({
  actionSlot,
  rootProps,
  ...inputProps
}: TextareaInputProps & { 
  actionSlot?: ReactNode; 
  rootProps?: TextareaRootProps;
  ref?: React.Ref<HTMLTextAreaElement>;
}) {
  if (actionSlot) {
    return (
      <TextareaRoot {...rootProps}>
        <TextareaInput {...inputProps} />
        <TextareaAction>{actionSlot}</TextareaAction>
      </TextareaRoot>
    );
  }

  return <TextareaInput {...inputProps} />;
}

export const Textarea = Object.assign(TextareaPrimitive, {
  Root: TextareaRoot,
  Input: TextareaInput,
  Action: TextareaAction,
});
