import type { CronField } from "./cron.types.ts";

export const cronFields: readonly CronField[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day of month", min: 1, max: 31 },
  {
    name: "month",
    min: 1,
    max: 12,
    names: [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ],
  },
  {
    name: "day of week",
    min: 0,
    max: 7,
    names: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
  },
];

export const cronMacros: Readonly<Record<string, string>> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

export const cronDefaultTimeZone = "UTC";
export const cronMaxExpressionLength = 256;
/** Covers a February 29 slot across a skipped leap year. */
export const cronSearchDays = 366 * 8 + 2;
export const cronDayMs = 86_400_000;
/** Bounds every real UTC offset, so candidates outside it are skipped cheaply. */
export const cronOffsetBoundMs = 15 * 3_600_000;
