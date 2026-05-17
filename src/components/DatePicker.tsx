import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import {
  CalendarRoot,
  CalendarHeader,
  CalendarPrevMonth,
  CalendarNextMonth,
  CalendarMonthLabel,
  CalendarGrid,
  type CalendarRootProps,
} from "./Calendar";
import type { WeekDay } from "../internal/date";

export interface DatePickerRootProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  locale?: string | Intl.Locale;
  weekStartsOn?: WeekDay;
  defaultMonth?: Date;
  children?: ReactNode;
}

interface DatePickerContextValue {
  value: Date | null;
  setValue: (value: Date | null) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentId: string;
  triggerId: string;
  locale?: string | Intl.Locale | undefined;
  weekStartsOn?: WeekDay | undefined;
  defaultMonth?: Date | undefined;
  min?: Date | undefined;
  max?: Date | undefined;
  isDateDisabled?: ((date: Date) => boolean) | undefined;
}

const DatePickerContext = createContext<DatePickerContextValue | null>(null);

function useDatePickerContext(): DatePickerContextValue {
  const ctx = useContext(DatePickerContext);
  if (!ctx) {
    throw new Error("DatePicker.* components must be used inside DatePicker.Root");
  }
  return ctx;
}

export function DatePickerRoot({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  min,
  max,
  isDateDisabled,
  locale,
  weekStartsOn,
  defaultMonth,
  children,
  ...props
}: DatePickerRootProps) {
  const isValueControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue);
  const value = isValueControlled ? valueProp ?? null : uncontrolledValue;

  const isOpenControlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
  const open = isOpenControlled ? openProp : uncontrolledOpen;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentId = useId();
  const triggerId = useId();
  const wasOpenRef = useRef(open);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange]
  );

  const setValue = useCallback(
    (next: Date | null) => {
      if (!isValueControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isValueControlled, onValueChange]
  );

  useEffect(() => {
    if (wasOpenRef.current && !open) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  const ctx: DatePickerContextValue = {
    value,
    setValue,
    open,
    setOpen,
    triggerRef,
    contentId,
    triggerId,
    locale,
    weekStartsOn,
    defaultMonth,
    min,
    max,
    isDateDisabled,
  };

  return (
    <DatePickerContext.Provider value={ctx}>
      <div
        data-ui="date-picker-root"
        data-state={open ? "open" : "closed"}
        style={{ position: "relative", display: "inline-block", ...props.style }}
        {...props}
      >
        {children ?? <DefaultDatePickerBody />}
      </div>
    </DatePickerContext.Provider>
  );
}

function DefaultDatePickerBody() {
  return (
    <>
      <DatePickerTrigger />
      <DatePickerContent>
        <DatePickerCalendar />
      </DatePickerContent>
    </>
  );
}

export interface DatePickerTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
  format?: Intl.DateTimeFormatOptions;
  children?: ReactNode;
}

export function DatePickerTrigger({
  placeholder = "Pick a date",
  format,
  onClick,
  children,
  ...props
}: DatePickerTriggerProps) {
  const ctx = useDatePickerContext();
  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(
        ctx.locale ? ctx.locale.toString() : undefined,
        format ?? { dateStyle: "medium" }
      ),
    [ctx.locale, format]
  );
  const label = children ?? (ctx.value ? fmt.format(ctx.value) : placeholder);

  return (
    <button
      ref={ctx.triggerRef}
      type="button"
      id={ctx.triggerId}
      data-ui="date-picker-trigger"
      data-state={ctx.open ? "open" : "closed"}
      aria-haspopup="dialog"
      aria-expanded={ctx.open}
      aria-controls={ctx.open ? ctx.contentId : undefined}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        ctx.setOpen(!ctx.open);
      }}
      {...props}
    >
      {label}
    </button>
  );
}

export interface DatePickerContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function DatePickerContent({ children, style, ...props }: DatePickerContentProps) {
  const ctx = useDatePickerContext();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ctx.open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (ref.current?.contains(target)) return;
      if (ctx.triggerRef.current?.contains(target)) return;
      ctx.setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        ctx.setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ctx]);

  if (!ctx.open) return null;

  return (
    <div
      ref={ref}
      id={ctx.contentId}
      role="dialog"
      aria-labelledby={ctx.triggerId}
      data-ui="date-picker-content"
      data-state="open"
      style={{ position: "absolute", top: "100%", left: 0, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

export type DatePickerCalendarProps = Omit<
  CalendarRootProps,
  "value" | "defaultValue" | "onValueChange" | "min" | "max" | "isDateDisabled" | "locale" | "weekStartsOn" | "defaultMonth"
>;

export function DatePickerCalendar(props: DatePickerCalendarProps) {
  const ctx = useDatePickerContext();
  const handleChange = useCallback(
    (next: Date | null) => {
      ctx.setValue(next);
      if (next) ctx.setOpen(false);
    },
    [ctx]
  );

  return (
    <CalendarRoot
      value={ctx.value}
      onValueChange={handleChange}
      defaultMonth={ctx.defaultMonth ?? ctx.value ?? undefined}
      min={ctx.min}
      max={ctx.max}
      isDateDisabled={ctx.isDateDisabled}
      locale={ctx.locale}
      weekStartsOn={ctx.weekStartsOn}
      {...props}
    />
  );
}

export const DatePicker = {
  Root: DatePickerRoot,
  Trigger: DatePickerTrigger,
  Content: DatePickerContent,
  Calendar: DatePickerCalendar,
  Header: CalendarHeader,
  PrevMonth: CalendarPrevMonth,
  NextMonth: CalendarNextMonth,
  MonthLabel: CalendarMonthLabel,
  Grid: CalendarGrid,
};
