/**
 * METER · Time & Date (12 tools)
 *
 * Calendar arithmetic done entirely in UTC (via Date.UTC) so results never
 * depend on the machine's timezone and the worked examples stay deterministic.
 * "As of"/"from" dates are optional and default to today for live use.
 */

import { need, needPos, fail, out, P, R, M, fmt, unit, duration, plural, ordinal } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

const DAY = 86400000;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parseDate = (s: unknown, label: string): Date => {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s ?? "").trim());
  if (!m) fail(`Enter ${label} as YYYY-MM-DD.`);
  const d = new Date(Date.UTC(+m![1], +m![2] - 1, +m![3]));
  if (Number.isNaN(d.getTime())) fail(`${label} is not a valid date.`);
  return d;
};
const parseTime = (s: unknown): number => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(s ?? "").trim());
  if (!m) fail("Enter a time like 09:00.");
  return (+m![1]) * 60 + (+m![2]);
};
const fmtDate = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
const todayUTC = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
};
const daysInMonth = (y: number, m0: number) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();

export const CALCULATORS: CalcSpec[] = [
  {
    id: "age-calculator", name: "Age Calculator", category: "time-date",
    description: "Exact age in years, months and days between two dates.",
    keywords: ["age", "birthday", "how old", "years", "date of birth", "dob"],
    icon: "Cake", featured: true, popularity: 86,
    fields: [
      { key: "birth", label: "Date of birth", kind: "date", def: "1990-06-15" },
      { key: "asOf", label: "As of date", kind: "date", optional: true, help: "Defaults to today" },
    ],
    compute: (v) => {
      const b = parseDate(v.birth, "date of birth");
      const e = v.asOf ? parseDate(v.asOf, "as-of date") : todayUTC();
      if (e.getTime() < b.getTime()) fail("The as-of date is before the birth date.");
      let y = e.getUTCFullYear() - b.getUTCFullYear();
      let mo = e.getUTCMonth() - b.getUTCMonth();
      let da = e.getUTCDate() - b.getUTCDate();
      if (da < 0) { mo--; da += daysInMonth(e.getUTCFullYear(), e.getUTCMonth() - 1); }
      if (mo < 0) { y--; mo += 12; }
      const totalDays = Math.floor((e.getTime() - b.getTime()) / DAY);
      return out(
        [
          P("Age", `${plural(y, "year")}, ${plural(mo, "month")}, ${plural(da, "day")}`),
          R("Total days", plural(totalDays, "day")),
          R("Total weeks", plural(Math.floor(totalDays / 7), "week")),
          M("Total months", plural(y * 12 + mo, "month")),
        ],
      );
    },
    examples: [{ label: "Born 1990-06-15, as of 2020-06-15", inputs: { birth: "1990-06-15", asOf: "2020-06-15" }, expect: "30" }],
  },
  {
    id: "date-difference", name: "Date Difference Calculator", category: "time-date",
    description: "Days, weeks and months between two dates.",
    keywords: ["date difference", "days between", "duration", "date range", "how many days"],
    icon: "CalendarRange", featured: true, popularity: 76,
    fields: [
      { key: "start", label: "Start date", kind: "date", def: "2024-01-01" },
      { key: "end", label: "End date", kind: "date", def: "2024-12-31" },
    ],
    compute: (v) => {
      const s = parseDate(v.start, "start date");
      const e = parseDate(v.end, "end date");
      const days = Math.abs(Math.round((e.getTime() - s.getTime()) / DAY));
      return [
        P("Difference", plural(days, "day")),
        R("Weeks", `${fmt(days / 7)} weeks`),
        R("Weeks & days", `${Math.floor(days / 7)} weeks, ${days % 7} days`),
        M("Approx. months", fmt(days / 30.4375)),
      ];
    },
    examples: [{ label: "2024-01-01 to 2024-12-31", inputs: { start: "2024-01-01", end: "2024-12-31" }, expect: "365" }],
  },
  {
    id: "date-add", name: "Add or Subtract Dates", category: "time-date",
    description: "Add or subtract days, weeks, months or years from a date.",
    keywords: ["date add", "date calculator", "add days", "subtract", "future date", "deadline"],
    icon: "CalendarPlus", popularity: 66,
    fields: [
      { key: "date", label: "Start date", kind: "date", def: "2025-01-01" },
      { key: "amount", label: "Amount (negative to subtract)", def: 30, step: 1 },
      {
        key: "unit", label: "Unit", kind: "select", def: "days",
        options: [{ value: "days", label: "Days" }, { value: "weeks", label: "Weeks" }, { value: "months", label: "Months" }, { value: "years", label: "Years" }],
      },
    ],
    compute: (v) => {
      const base = parseDate(v.date, "start date");
      const amt = Math.trunc(need(v.amount, "Amount"));
      const d = new Date(base.getTime());
      const u = String(v.unit);
      if (u === "days") d.setUTCDate(d.getUTCDate() + amt);
      else if (u === "weeks") d.setUTCDate(d.getUTCDate() + amt * 7);
      else if (u === "months") d.setUTCMonth(d.getUTCMonth() + amt);
      else d.setUTCFullYear(d.getUTCFullYear() + amt);
      return [P("Result date", fmtDate(d)), R("Day of week", DAY_NAMES[d.getUTCDay()])];
    },
    examples: [{ label: "2025-01-01 + 30 days", inputs: { date: "2025-01-01", amount: 30, unit: "days" }, expect: "2025-01-31" }],
  },
  {
    id: "countdown-days", name: "Countdown Calculator", category: "time-date",
    description: "Days remaining until a target date.",
    keywords: ["countdown", "days until", "days left", "event", "deadline", "remaining"],
    icon: "CalendarClock", featured: true, popularity: 70,
    fields: [
      { key: "target", label: "Target date", kind: "date", def: "2026-01-31" },
      { key: "from", label: "From date", kind: "date", optional: true, help: "Defaults to today" },
    ],
    compute: (v) => {
      const target = parseDate(v.target, "target date");
      const from = v.from ? parseDate(v.from, "from date") : todayUTC();
      const days = Math.round((target.getTime() - from.getTime()) / DAY);
      const label = days < 0 ? "days ago" : "days remaining";
      return [
        P(days < 0 ? "In the past" : "Countdown", `${Math.abs(days)} ${label}`),
        R("Weeks", fmt(Math.abs(days) / 7)),
        M("Falls on a", DAY_NAMES[target.getUTCDay()]),
      ];
    },
    examples: [{ label: "2026-01-01 to 2026-01-31", inputs: { target: "2026-01-31", from: "2026-01-01" }, expect: "30" }],
  },
  {
    id: "time-duration", name: "Time Duration Calculator", category: "time-date",
    description: "Elapsed time between two clock times (handles overnight).",
    keywords: ["time duration", "hours between", "elapsed", "time difference", "clock", "shift"],
    icon: "Timer", popularity: 64,
    fields: [
      { key: "start", label: "Start time", kind: "time", def: "09:00" },
      { key: "end", label: "End time", kind: "time", def: "17:30" },
    ],
    compute: (v) => {
      const s = parseTime(v.start);
      const e = parseTime(v.end);
      let mins = e - s;
      if (mins < 0) mins += 1440;
      return [P("Duration", duration(mins * 60)), R("In hours", unit(mins / 60, "h")), M("In minutes", `${mins} min`)];
    },
    examples: [{ label: "09:00 to 17:30", inputs: { start: "09:00", end: "17:30" }, expect: "8.5" }],
  },
  {
    id: "day-of-week", name: "Day of the Week Finder", category: "time-date",
    description: "The weekday and day-of-year for any date.",
    keywords: ["day of week", "what day", "weekday", "day of year", "calendar"],
    icon: "Calendar", popularity: 54,
    fields: [{ key: "date", label: "Date", kind: "date", def: "2000-01-01" }],
    compute: (v) => {
      const d = parseDate(v.date, "date");
      const dayOfYear = Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / DAY) + 1;
      return out(
        [
          P("Day of the week", DAY_NAMES[d.getUTCDay()]),
          R("Day of the year", `${ordinal(dayOfYear)} day`),
          M("Month", MONTHS[d.getUTCMonth()]),
        ],
      );
    },
    examples: [{ label: "1 Jan 2000", inputs: { date: "2000-01-01" }, expect: "Saturday" }],
  },
  {
    id: "week-number", name: "Week Number Calculator", category: "time-date",
    description: "The ISO-8601 week number for a given date.",
    keywords: ["week number", "iso week", "calendar week", "which week", "iso 8601"],
    icon: "CalendarDays", popularity: 46,
    fields: [{ key: "date", label: "Date", kind: "date", def: "2024-01-01" }],
    compute: (v) => {
      const d = parseDate(v.date, "date");
      const t = new Date(d.getTime());
      const dayNr = (t.getUTCDay() + 6) % 7;
      t.setUTCDate(t.getUTCDate() - dayNr + 3);
      const firstThursday = t.getTime();
      t.setUTCMonth(0, 1);
      if (t.getUTCDay() !== 4) t.setUTCMonth(0, 1 + ((4 - t.getUTCDay()) + 7) % 7);
      const week = 1 + Math.ceil((firstThursday - t.getTime()) / (7 * DAY));
      return [P("ISO week number", `Week ${week}`), R("Weekday", DAY_NAMES[d.getUTCDay()])];
    },
    examples: [{ label: "1 Jan 2024", inputs: { date: "2024-01-01" }, expect: "Week 1" }],
  },
  {
    id: "business-days", name: "Business Days Calculator", category: "time-date",
    description: "Count working days (excluding weekends) between two dates.",
    keywords: ["business days", "working days", "weekdays", "excluding weekends", "workdays"],
    icon: "Briefcase", popularity: 58,
    fields: [
      { key: "start", label: "Start date", kind: "date", def: "2024-01-01" },
      { key: "end", label: "End date", kind: "date", def: "2024-01-14" },
    ],
    compute: (v) => {
      let s = parseDate(v.start, "start date");
      let e = parseDate(v.end, "end date");
      if (e.getTime() < s.getTime()) [s, e] = [e, s];
      let business = 0, weekend = 0;
      const cur = new Date(s.getTime());
      let guard = 0;
      while (cur.getTime() <= e.getTime() && guard++ < 400000) {
        const dow = cur.getUTCDay();
        if (dow === 0 || dow === 6) weekend++; else business++;
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
      return [P("Business days", `${business}`), R("Weekend days", `${weekend}`), M("Total days", `${business + weekend}`)];
    },
    examples: [{ label: "2024-01-01 to 2024-01-14", inputs: { start: "2024-01-01", end: "2024-01-14" }, expect: "10" }],
  },
  {
    id: "unix-timestamp", name: "Unix Timestamp Converter", category: "time-date",
    description: "Convert a date to its Unix epoch time in seconds.",
    keywords: ["unix timestamp", "epoch", "unix time", "seconds", "posix", "utc"],
    icon: "Clock", popularity: 50,
    fields: [{ key: "date", label: "Date (UTC)", kind: "date", def: "2000-01-01" }],
    formula: "epoch = milliseconds since 1970-01-01 UTC ÷ 1000",
    compute: (v) => {
      const d = parseDate(v.date, "date");
      const secs = Math.floor(d.getTime() / 1000);
      return [P("Unix timestamp", `${secs}`), R("In milliseconds", `${d.getTime()}`), M("ISO 8601", `${fmtDate(d)}T00:00:00Z`)];
    },
    examples: [{ label: "2000-01-01 UTC", inputs: { date: "2000-01-01" }, expect: "946684800" }],
  },
  {
    id: "leap-year", name: "Leap Year Checker", category: "time-date",
    description: "Check whether a year is a leap year and find the next one.",
    keywords: ["leap year", "366 days", "february 29", "gregorian", "calendar"],
    icon: "Calendar", popularity: 48,
    fields: [{ key: "year", label: "Year", def: 2024, min: 1, step: 1 }],
    formula: "Leap if divisible by 4, except centuries not divisible by 400",
    compute: (v) => {
      const y = Math.trunc(needPos(v.year, "Year"));
      const isLeap = (n: number) => (n % 4 === 0 && n % 100 !== 0) || n % 400 === 0;
      let next = y;
      while (!isLeap(next)) next++;
      return [
        P(`Year ${y}`, isLeap(y) ? "Leap year (366 days)" : "Common year (365 days)"),
        R("Next leap year", `${isLeap(y) ? y : next}`),
        M("February has", isLeap(y) ? "29 days" : "28 days"),
      ];
    },
    examples: [{ label: "2024", inputs: { year: 2024 }, expect: "Leap year" }],
  },
  {
    id: "days-in-month", name: "Days in Month Calculator", category: "time-date",
    description: "Number of days in a given month and year.",
    keywords: ["days in month", "month length", "calendar", "february", "how many days"],
    icon: "CalendarDays", popularity: 42,
    fields: [
      { key: "year", label: "Year", def: 2024, min: 1, step: 1 },
      { key: "month", label: "Month", kind: "select", def: "2", options: MONTHS.map((m, i) => ({ value: `${i + 1}`, label: m })) },
    ],
    compute: (v) => {
      const y = Math.trunc(needPos(v.year, "Year"));
      const m0 = parseInt(String(v.month), 10) - 1;
      const days = daysInMonth(y, m0);
      return [P(`${MONTHS[m0]} ${y}`, plural(days, "day")), R("First day", DAY_NAMES[new Date(Date.UTC(y, m0, 1)).getUTCDay()])];
    },
    examples: [{ label: "February 2024", inputs: { year: 2024, month: "2" }, expect: "29" }],
  },
  {
    id: "work-hours-year", name: "Annual Work Hours Calculator", category: "time-date",
    description: "Total working hours per month and year from a weekly schedule.",
    keywords: ["work hours", "annual hours", "weekly", "yearly", "full time", "schedule"],
    icon: "Briefcase", popularity: 44,
    fields: [
      { key: "perWeek", label: "Hours per week", def: 40, min: 0, unit: "h" },
      { key: "weeksOff", label: "Weeks off per year", def: 0, min: 0, max: 52, optional: true },
    ],
    compute: (v) => {
      const perWeek = needPos(v.perWeek, "Hours per week");
      const off = Number.isFinite(v.weeksOff) ? Math.max(0, v.weeksOff) : 0;
      const weeks = 52 - off;
      return [P("Hours per year", unit(perWeek * weeks, "h")), R("Hours per month", unit((perWeek * weeks) / 12, "h")), M("Working weeks", `${fmt(weeks)}`)];
    },
    examples: [{ label: "40 h/week, no time off", inputs: { perWeek: 40, weeksOff: 0 }, expect: "2,080" }],
  },
];
