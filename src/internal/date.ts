export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function addMonths(date: Date, amount: number): Date {
  const day = date.getDate();
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = endOfMonth(target).getDate();
  target.setDate(Math.min(day, lastDay));
  target.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
  return target;
}

export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

const ISO_WEEK_START_FALLBACK: Record<string, WeekDay> = {
  US: 0, CA: 0, MX: 0, JP: 0, KR: 0, BR: 0, IL: 0, ZA: 0,
  GB: 1, FR: 1, DE: 1, ES: 1, IT: 1, NL: 1, PL: 1, RU: 1, CN: 1, AU: 1, NZ: 1, SE: 1, NO: 1, FI: 1, DK: 1, BE: 1, AT: 1, CH: 1, IE: 1, PT: 1, GR: 1, TR: 1, IN: 1,
};

interface IntlLocaleWithWeekInfo extends Intl.Locale {
  getWeekInfo?: () => { firstDay: number };
  weekInfo?: { firstDay: number };
}

export function getWeekStartsOn(locale?: string | Intl.Locale): WeekDay {
  try {
    const loc = (typeof locale === "string" || locale === undefined
      ? new Intl.Locale(locale ?? (typeof navigator !== "undefined" ? navigator.language : "en-US"))
      : locale) as IntlLocaleWithWeekInfo;
    const info = typeof loc.getWeekInfo === "function" ? loc.getWeekInfo() : loc.weekInfo;
    if (info && typeof info.firstDay === "number") {
      // Intl spec: 1=Mon..7=Sun. Convert to JS Date convention 0=Sun..6=Sat.
      return (info.firstDay === 7 ? 0 : info.firstDay) as WeekDay;
    }
    const region = loc.region ?? loc.maximize().region;
    if (region && ISO_WEEK_START_FALLBACK[region] !== undefined) {
      return ISO_WEEK_START_FALLBACK[region];
    }
  } catch {
    /* fall through */
  }
  return 1;
}

export function getWeekdayOrder(weekStartsOn: WeekDay): WeekDay[] {
  return [0, 1, 2, 3, 4, 5, 6].map((i) => ((weekStartsOn + i) % 7) as WeekDay) as WeekDay[];
}

export function buildMonthGrid(month: Date, weekStartsOn: WeekDay): Date[][] {
  const first = startOfMonth(month);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(first, -offset);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(addDays(gridStart, w * 7 + d));
    }
    weeks.push(week);
  }
  return weeks;
}

export interface DisabledOptions {
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
}

export function isDayDisabled(date: Date, { min, max, isDateDisabled }: DisabledOptions): boolean {
  if (min && isBefore(date, min)) return true;
  if (max && isAfter(date, max)) return true;
  if (isDateDisabled && isDateDisabled(date)) return true;
  return false;
}

export function clampToRange(date: Date, min?: Date, max?: Date): Date {
  if (min && isBefore(date, min)) return min;
  if (max && isAfter(date, max)) return max;
  return date;
}
