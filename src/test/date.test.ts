import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  addYears,
  buildMonthGrid,
  clampToRange,
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
} from "../internal/date";

describe("date utils", () => {
  describe("startOfDay", () => {
    it("normalizes time to midnight", () => {
      const d = startOfDay(new Date(2026, 3, 17, 14, 30, 5));
      expect(d.getHours()).toBe(0);
      expect(d.getMinutes()).toBe(0);
      expect(d.getSeconds()).toBe(0);
      expect(d.getMilliseconds()).toBe(0);
    });
  });

  describe("startOfMonth / endOfMonth", () => {
    it("returns first day of month", () => {
      const d = startOfMonth(new Date(2026, 3, 17));
      expect(d.getDate()).toBe(1);
      expect(d.getMonth()).toBe(3);
    });

    it("returns last day of February in a leap year", () => {
      expect(endOfMonth(new Date(2024, 1, 10)).getDate()).toBe(29);
    });

    it("returns last day of February in a non-leap year", () => {
      expect(endOfMonth(new Date(2026, 1, 10)).getDate()).toBe(28);
    });
  });

  describe("addDays / addMonths / addYears", () => {
    it("crosses month boundary forward", () => {
      const d = addDays(new Date(2026, 0, 31), 1);
      expect(d.getMonth()).toBe(1);
      expect(d.getDate()).toBe(1);
    });

    it("crosses year boundary backward", () => {
      const d = addDays(new Date(2026, 0, 1), -1);
      expect(d.getFullYear()).toBe(2025);
      expect(d.getMonth()).toBe(11);
      expect(d.getDate()).toBe(31);
    });

    it("clamps day-of-month when target month has fewer days", () => {
      const d = addMonths(new Date(2026, 0, 31), 1);
      expect(d.getMonth()).toBe(1);
      expect(d.getDate()).toBe(28);
    });

    it("handles leap year when adding years", () => {
      const d = addYears(new Date(2024, 1, 29), 1);
      expect(d.getMonth()).toBe(1);
      expect(d.getDate()).toBe(28);
    });
  });

  describe("comparison helpers", () => {
    const a = new Date(2026, 3, 17, 10);
    const b = new Date(2026, 3, 17, 23);
    const c = new Date(2026, 3, 18);

    it("isSameDay ignores time-of-day", () => {
      expect(isSameDay(a, b)).toBe(true);
      expect(isSameDay(a, c)).toBe(false);
    });

    it("isSameMonth", () => {
      expect(isSameMonth(a, new Date(2026, 3, 1))).toBe(true);
      expect(isSameMonth(a, new Date(2026, 4, 1))).toBe(false);
    });

    it("isBefore / isAfter use calendar day", () => {
      expect(isBefore(a, c)).toBe(true);
      expect(isAfter(c, a)).toBe(true);
      expect(isBefore(a, b)).toBe(false);
      expect(isAfter(a, b)).toBe(false);
    });
  });

  describe("getWeekStartsOn", () => {
    it("returns 0 (Sunday) for US locales", () => {
      expect(getWeekStartsOn("en-US")).toBe(0);
      expect(getWeekStartsOn("ko-KR")).toBe(0);
    });

    it("returns 1 (Monday) for most European locales", () => {
      expect(getWeekStartsOn("en-GB")).toBe(1);
      expect(getWeekStartsOn("de-DE")).toBe(1);
    });

    it("returns a valid weekday for unknown locales", () => {
      const v = getWeekStartsOn("xx-XX");
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(6);
    });
  });

  describe("getWeekdayOrder", () => {
    it("rotates from Sunday-start", () => {
      expect(getWeekdayOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
    it("rotates from Monday-start", () => {
      expect(getWeekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    });
  });

  describe("buildMonthGrid", () => {
    it("returns 6 weeks of 7 days each", () => {
      const grid = buildMonthGrid(new Date(2026, 3, 15), 0);
      expect(grid).toHaveLength(6);
      grid.forEach((week) => expect(week).toHaveLength(7));
    });

    it("starts on the configured weekStartsOn", () => {
      const grid = buildMonthGrid(new Date(2026, 3, 15), 1);
      expect(grid[0]![0]!.getDay()).toBe(1);
    });

    it("includes the first day of the target month", () => {
      const grid = buildMonthGrid(new Date(2026, 3, 15), 0);
      const flat = grid.flat();
      expect(flat.some((d) => isSameDay(d, new Date(2026, 3, 1)))).toBe(true);
    });

    it("first cell is on or before the first of the month", () => {
      const grid = buildMonthGrid(new Date(2026, 3, 15), 0);
      const first = grid[0]![0]!;
      expect(first.getTime()).toBeLessThanOrEqual(new Date(2026, 3, 1).getTime());
    });
  });

  describe("isDayDisabled", () => {
    const d = new Date(2026, 3, 17);

    it("disables before min", () => {
      expect(isDayDisabled(d, { min: new Date(2026, 3, 18) })).toBe(true);
    });

    it("disables after max", () => {
      expect(isDayDisabled(d, { max: new Date(2026, 3, 16) })).toBe(true);
    });

    it("respects custom predicate", () => {
      expect(isDayDisabled(d, { isDateDisabled: () => true })).toBe(true);
    });

    it("allows when within range and predicate false", () => {
      expect(
        isDayDisabled(d, {
          min: new Date(2026, 0, 1),
          max: new Date(2026, 11, 31),
          isDateDisabled: () => false,
        })
      ).toBe(false);
    });
  });

  describe("clampToRange", () => {
    it("clamps to min", () => {
      const min = new Date(2026, 3, 10);
      expect(clampToRange(new Date(2026, 3, 1), min).getTime()).toBe(min.getTime());
    });
    it("clamps to max", () => {
      const max = new Date(2026, 3, 10);
      expect(clampToRange(new Date(2026, 3, 20), undefined, max).getTime()).toBe(max.getTime());
    });
    it("returns input when within range", () => {
      const d = new Date(2026, 3, 15);
      expect(clampToRange(d, new Date(2026, 3, 10), new Date(2026, 3, 20))).toBe(d);
    });
  });
});
