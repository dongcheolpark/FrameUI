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
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react";
import {
  addDays,
  addMonths,
  addYears,
  buildMonthGrid,
  endOfMonth,
  getWeekStartsOn,
  getWeekdayOrder,
  isAfter,
  isBefore,
  isDayDisabled,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  type WeekDay,
} from "../internal/date";

export interface CalendarRootProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: Date | null | undefined;
  defaultValue?: Date | null | undefined;
  onValueChange?: ((value: Date | null) => void) | undefined;
  month?: Date | undefined;
  defaultMonth?: Date | undefined;
  onMonthChange?: ((month: Date) => void) | undefined;
  min?: Date | undefined;
  max?: Date | undefined;
  isDateDisabled?: ((date: Date) => boolean) | undefined;
  locale?: string | Intl.Locale | undefined;
  weekStartsOn?: WeekDay | undefined;
  children?: ReactNode;
}

interface CalendarContextValue {
  value: Date | null;
  selectDate: (date: Date) => void;
  month: Date;
  changeMonth: (month: Date, focus?: boolean) => void;
  focusedDay: Date;
  setFocusedDay: (date: Date, focus?: boolean) => void;
  registerDayButton: (key: string, el: HTMLButtonElement | null) => void;
  locale: Intl.Locale;
  weekStartsOn: WeekDay;
  min?: Date | undefined;
  max?: Date | undefined;
  isDateDisabled?: ((date: Date) => boolean) | undefined;
  monthLabelId: string;
  today: Date;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

function useCalendarContext(): CalendarContextValue {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error("Calendar.* components must be used inside Calendar.Root");
  }
  return ctx;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function resolveLocale(input?: string | Intl.Locale): Intl.Locale {
  if (input instanceof Intl.Locale) return input;
  try {
    return new Intl.Locale(
      input ?? (typeof navigator !== "undefined" ? navigator.language : "en-US")
    );
  } catch {
    return new Intl.Locale("en-US");
  }
}

function clampDayOfMonth(target: Date, dayOfMonth: number): Date {
  const last = endOfMonth(target).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(dayOfMonth, last));
}

export function CalendarRoot({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  min,
  max,
  isDateDisabled,
  locale: localeInput,
  weekStartsOn: weekStartsOnProp,
  children,
  ...props
}: CalendarRootProps) {
  const isControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue);
  const value = isControlled ? valueProp ?? null : uncontrolledValue;

  const isMonthControlled = monthProp !== undefined;
  const [uncontrolledMonth, setUncontrolledMonth] = useState<Date>(() =>
    startOfMonth(defaultMonth ?? value ?? new Date())
  );
  const month = isMonthControlled ? startOfMonth(monthProp) : uncontrolledMonth;

  const today = useMemo(() => startOfDay(new Date()), []);
  const locale = useMemo(() => resolveLocale(localeInput), [localeInput]);
  const weekStartsOn = weekStartsOnProp ?? getWeekStartsOn(locale);

  const computeInitialFocus = useCallback(
    (m: Date): Date => {
      const inMonth = (d: Date | undefined): Date | undefined =>
        d && isSameMonth(d, m) && !isDayDisabled(d, { min, max, isDateDisabled }) ? d : undefined;
      return (
        inMonth(value ?? undefined) ??
        inMonth(today) ??
        inMonth(min) ??
        startOfMonth(m)
      );
    },
    [value, today, min, max, isDateDisabled]
  );

  const [focusedDay, setFocusedDayState] = useState<Date>(() => computeInitialFocus(month));
  const shouldFocusRef = useRef(false);
  const dayButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const monthLabelId = useId();

  const registerDayButton = useCallback((key: string, el: HTMLButtonElement | null) => {
    if (el) {
      dayButtonsRef.current.set(key, el);
    } else {
      dayButtonsRef.current.delete(key);
    }
  }, []);

  const setFocusedDay = useCallback((date: Date, focus = true) => {
    setFocusedDayState(date);
    if (focus) shouldFocusRef.current = true;
  }, []);

  const changeMonth = useCallback(
    (next: Date, focus = true) => {
      const normalized = startOfMonth(next);
      if (!isMonthControlled) {
        setUncontrolledMonth(normalized);
      }
      onMonthChange?.(normalized);
      setFocusedDayState((prev) => clampDayOfMonth(normalized, prev.getDate()));
      if (focus) shouldFocusRef.current = true;
    },
    [isMonthControlled, onMonthChange]
  );

  useEffect(() => {
    if (!isSameMonth(focusedDay, month)) {
      setFocusedDayState(clampDayOfMonth(month, focusedDay.getDate()));
    }
  }, [month, focusedDay]);

  useEffect(() => {
    if (!shouldFocusRef.current) return;
    const el = dayButtonsRef.current.get(toDateKey(focusedDay));
    if (el) {
      el.focus();
      shouldFocusRef.current = false;
    }
  }, [focusedDay]);

  const selectDate = useCallback(
    (date: Date) => {
      if (isDayDisabled(date, { min, max, isDateDisabled })) return;
      const normalized = startOfDay(date);
      if (!isControlled) {
        setUncontrolledValue(normalized);
      }
      onValueChange?.(normalized);
    },
    [isControlled, isDateDisabled, max, min, onValueChange]
  );

  const ctx: CalendarContextValue = {
    value,
    selectDate,
    month,
    changeMonth,
    focusedDay,
    setFocusedDay,
    registerDayButton,
    locale,
    weekStartsOn,
    min,
    max,
    isDateDisabled,
    monthLabelId,
    today,
  };

  return (
    <CalendarContext.Provider value={ctx}>
      <div data-ui="calendar-root" {...props}>
        {children ?? <DefaultCalendarBody />}
      </div>
    </CalendarContext.Provider>
  );
}

function DefaultCalendarBody() {
  return (
    <>
      <CalendarHeader>
        <CalendarPrevMonth>‹</CalendarPrevMonth>
        <CalendarMonthLabel />
        <CalendarNextMonth>›</CalendarNextMonth>
      </CalendarHeader>
      <CalendarGrid />
    </>
  );
}

export interface CalendarHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function CalendarHeader({ children, ...props }: CalendarHeaderProps) {
  return (
    <div data-ui="calendar-header" {...props}>
      {children}
    </div>
  );
}

export interface CalendarNavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export function CalendarPrevMonth({
  children,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: CalendarNavButtonProps) {
  const { month, changeMonth, min } = useCalendarContext();
  const prev = addMonths(month, -1);
  const lastOfPrev = endOfMonth(prev);
  const disabled = min ? isBefore(lastOfPrev, startOfDay(min)) : false;
  return (
    <button
      type="button"
      data-ui="calendar-prev-month"
      aria-label={ariaLabel ?? "Previous month"}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || disabled) return;
        changeMonth(prev, false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function CalendarNextMonth({
  children,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: CalendarNavButtonProps) {
  const { month, changeMonth, max } = useCalendarContext();
  const next = addMonths(month, 1);
  const disabled = max ? isAfter(next, startOfDay(max)) : false;
  return (
    <button
      type="button"
      data-ui="calendar-next-month"
      aria-label={ariaLabel ?? "Next month"}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || disabled) return;
        changeMonth(next, false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export interface CalendarMonthLabelProps extends HTMLAttributes<HTMLDivElement> {
  format?: Intl.DateTimeFormatOptions;
}

export function CalendarMonthLabel({ format, ...props }: CalendarMonthLabelProps) {
  const { month, locale, monthLabelId } = useCalendarContext();
  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(
        locale.toString(),
        format ?? { year: "numeric", month: "long" }
      ),
    [locale, format]
  );
  return (
    <div
      id={monthLabelId}
      data-ui="calendar-month-label"
      aria-live="polite"
      {...props}
    >
      {fmt.format(month)}
    </div>
  );
}

export interface CalendarGridProps extends HTMLAttributes<HTMLDivElement> {
  weekdayFormat?: "narrow" | "short" | "long";
  hideWeekdays?: boolean;
}

export function CalendarGrid({
  weekdayFormat = "short",
  hideWeekdays = false,
  onKeyDown,
  ...props
}: CalendarGridProps) {
  const ctx = useCalendarContext();
  const { month, weekStartsOn, locale, monthLabelId } = ctx;

  const weeks = useMemo(() => buildMonthGrid(month, weekStartsOn), [month, weekStartsOn]);

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale.toString(), { weekday: weekdayFormat });
    return getWeekdayOrder(weekStartsOn).map((dow) => {
      const ref = new Date(2024, 8, 1 + dow); // 2024-09-01 is a Sunday
      return fmt.format(ref);
    });
  }, [locale, weekStartsOn, weekdayFormat]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    if (!target.matches('[data-ui="calendar-day"]')) return;

    const f = ctx.focusedDay;
    let next: Date | null = null;

    switch (e.key) {
      case "ArrowLeft":
        next = addDays(f, -1);
        break;
      case "ArrowRight":
        next = addDays(f, 1);
        break;
      case "ArrowUp":
        next = addDays(f, -7);
        break;
      case "ArrowDown":
        next = addDays(f, 7);
        break;
      case "Home": {
        const dow = (f.getDay() - weekStartsOn + 7) % 7;
        next = addDays(f, -dow);
        break;
      }
      case "End": {
        const dow = (f.getDay() - weekStartsOn + 7) % 7;
        next = addDays(f, 6 - dow);
        break;
      }
      case "PageUp":
        next = e.shiftKey ? addYears(f, -1) : addMonths(f, -1);
        break;
      case "PageDown":
        next = e.shiftKey ? addYears(f, 1) : addMonths(f, 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isDayDisabled(f, { min: ctx.min, max: ctx.max, isDateDisabled: ctx.isDateDisabled })) {
          ctx.selectDate(f);
        }
        return;
      default:
        return;
    }

    e.preventDefault();
    if (!next) return;
    if (ctx.min && isBefore(next, ctx.min)) next = ctx.min;
    if (ctx.max && isAfter(next, ctx.max)) next = ctx.max;

    if (!isSameMonth(next, ctx.month)) {
      ctx.changeMonth(next, false);
    }
    ctx.setFocusedDay(next, true);
  };

  return (
    <div
      role="grid"
      aria-labelledby={monthLabelId}
      data-ui="calendar-grid"
      onKeyDown={handleKeyDown}
      {...props}
    >
      {!hideWeekdays && (
        <div role="row" data-ui="calendar-weekday-row">
          {weekdayLabels.map((label, i) => (
            <div key={i} role="columnheader" data-ui="calendar-weekday">
              {label}
            </div>
          ))}
        </div>
      )}
      {weeks.map((week, wi) => (
        <div key={wi} role="row" data-ui="calendar-week">
          {week.map((day) => (
            <CalendarDay key={toDateKey(day)} date={day} />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CalendarDayProps {
  date: Date;
}

function CalendarDay({ date }: CalendarDayProps) {
  const ctx = useCalendarContext();
  const inMonth = isSameMonth(date, ctx.month);
  const isSelected = ctx.value ? isSameDay(ctx.value, date) : false;
  const isToday = isSameDay(date, ctx.today);
  const disabled = isDayDisabled(date, {
    min: ctx.min,
    max: ctx.max,
    isDateDisabled: ctx.isDateDisabled,
  });
  const isFocused = isSameDay(date, ctx.focusedDay);

  const state = disabled
    ? "disabled"
    : isSelected
    ? "selected"
    : isToday
    ? "today"
    : !inMonth
    ? "outside-month"
    : undefined;

  const labelFmt = useMemo(
    () => new Intl.DateTimeFormat(ctx.locale.toString(), { dateStyle: "long" }),
    [ctx.locale]
  );

  const tabIndex = !disabled && isFocused && inMonth ? 0 : -1;
  const key = toDateKey(date);

  return (
    <div
      role="gridcell"
      data-ui="calendar-cell"
      aria-selected={isSelected || undefined}
    >
      <button
        ref={(el) => ctx.registerDayButton(key, el)}
        type="button"
        data-ui="calendar-day"
        data-state={state}
        aria-current={isToday ? "date" : undefined}
        aria-disabled={disabled || undefined}
        aria-label={labelFmt.format(date)}
        tabIndex={tabIndex}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (!inMonth) {
            ctx.changeMonth(startOfMonth(date), false);
          }
          ctx.setFocusedDay(date, false);
          ctx.selectDate(date);
        }}
      >
        {date.getDate()}
      </button>
    </div>
  );
}

export const Calendar = {
  Root: CalendarRoot,
  Header: CalendarHeader,
  PrevMonth: CalendarPrevMonth,
  NextMonth: CalendarNextMonth,
  MonthLabel: CalendarMonthLabel,
  Grid: CalendarGrid,
};
