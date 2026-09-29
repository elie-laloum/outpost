import {
  cronDayMs,
  cronDefaultTimeZone,
  cronFields,
  cronMacros,
  cronMaxExpressionLength,
  cronOffsetBoundMs,
  cronSearchDays,
} from "./cron.constants.ts";
import type {
  CronField,
  CronOptions,
  CronPattern,
  CronSchedule,
} from "./cron.types.ts";

function fieldValue(token: string, field: CronField): number {
  const named = field.names?.indexOf(token.toUpperCase()) ?? -1;
  if (named >= 0) return field.min + named;
  const value = /^\d{1,2}$/.test(token) ? Number(token) : Number.NaN;
  if (!(value >= field.min && value <= field.max))
    throw new Error(`Invalid cron ${field.name}: ${token}`);
  return value;
}

function fieldRange(range: string, field: CronField, stepped: boolean) {
  if (range === "*") return [field.min, field.max] as const;
  const [first, last, extra] = range.split("-");
  if (extra !== undefined || first === undefined)
    throw new Error(`Invalid cron ${field.name}: ${range}`);
  const start = fieldValue(first, field);
  if (last !== undefined) return [start, fieldValue(last, field)] as const;
  return [start, stepped ? field.max : start] as const;
}

function parseField(text: string, field: CronField): Set<number> {
  const values = new Set<number>();
  for (const part of text.split(",")) {
    const [range, stepText, extra] = part.split("/");
    if (extra !== undefined || !range)
      throw new Error(`Invalid cron ${field.name}: ${part}`);
    const step = stepText === undefined ? 1 : Number(stepText);
    if (!/^\d+$/.test(stepText ?? "1") || step < 1 || step > field.max)
      throw new Error(`Invalid cron ${field.name} step: ${part}`);
    const [start, end] = fieldRange(range, field, stepText !== undefined);
    if (start > end) throw new Error(`Invalid cron ${field.name}: ${part}`);
    for (let value = start; value <= end; value += step) values.add(value);
  }
  return values;
}

function parsePattern(expression: string): CronPattern {
  const fields = expression.split(" ");
  if (fields.length !== cronFields.length)
    throw new Error("Cron expressions require five fields");
  const [minutes, hours, days, months, weekdays] = fields.map((text, index) =>
    parseField(text, cronFields[index]!),
  ) as [Set<number>, Set<number>, Set<number>, Set<number>, Set<number>];
  if (weekdays.delete(7)) weekdays.add(0);
  return Object.freeze({
    minutes: [...minutes].sort((a, b) => a - b),
    hours: [...hours].sort((a, b) => a - b),
    days,
    months,
    weekdays,
    eitherDay: !fields[2]!.startsWith("*") && !fields[4]!.startsWith("*"),
  });
}

function matchesDay(pattern: CronPattern, date: Date): boolean {
  if (!pattern.months.has(date.getUTCMonth() + 1)) return false;
  const day = pattern.days.has(date.getUTCDate());
  const weekday = pattern.weekdays.has(date.getUTCDay());
  return pattern.eitherDay ? day || weekday : day && weekday;
}

function zoneFormatter(timeZone: string): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  } catch {
    throw new Error(`Invalid cron time zone: ${timeZone}`);
  }
}

function zoneClock(timeZone: string) {
  const formatter = zoneFormatter(timeZone);
  const utc = formatter.resolvedOptions().timeZone === "UTC";
  function wallClock(instant: number): number {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(instant)
        .map((part) => [part.type, Number(part.value)]),
    );
    return Date.UTC(
      parts.year!,
      parts.month! - 1,
      parts.day!,
      parts.hour!,
      parts.minute!,
      parts.second!,
    );
  }
  /** Offsets observed around a local day; two values mark a DST transition. */
  function offsets(day: number): readonly number[] {
    if (utc) return [0];
    const probes = [-cronDayMs, 0, cronDayMs, 2 * cronDayMs].map(
      (shift) => day + shift,
    );
    return [...new Set(probes.map((probe) => wallClock(probe) - probe))];
  }
  /** Earliest instant showing this wall-clock time; none inside a DST gap. */
  function instant(local: number, around: readonly number[]) {
    if (around.length === 1) return local - around[0]!;
    const matches = around
      .map((offset) => local - offset)
      .filter((candidate) => wallClock(candidate) === local);
    return matches.length ? Math.min(...matches) : undefined;
  }
  return {
    timeZone: formatter.resolvedOptions().timeZone,
    wallClock,
    offsets,
    instant,
  };
}

function checkedTime(value: Date, name: string): number {
  const time = value instanceof Date ? value.getTime() : Number.NaN;
  if (!Number.isFinite(time)) throw new Error(`Invalid cron ${name} date`);
  return time;
}

function localStart(wallClock: number): number {
  return wallClock - (wallClock % cronDayMs);
}

function localTimes(pattern: CronPattern, day: number): number[] {
  return pattern.hours.flatMap((hour) =>
    pattern.minutes.map((minute) => day + hour * 3_600_000 + minute * 60_000),
  );
}

function normalizedExpression(expression: string): string {
  if (
    typeof expression !== "string" ||
    expression.length > cronMaxExpressionLength
  )
    throw new Error("Invalid cron expression");
  const text = expression.trim().split(/\s+/).join(" ");
  return cronMacros[text.toLowerCase()] ?? text;
}

export function cronSchedule(
  expression: string,
  options: CronOptions = {},
): CronSchedule {
  const text = normalizedExpression(expression);
  const pattern = parsePattern(text);
  const zone = zoneClock(options.timeZone ?? cronDefaultTimeZone);
  function search(
    from: number,
    direction: 1 | -1,
    accept: (at: number) => boolean,
  ) {
    const first = localStart(zone.wallClock(from)) - direction * cronDayMs;
    for (let index = 0; index < cronSearchDays; index++) {
      const day = first + direction * index * cronDayMs;
      if (!matchesDay(pattern, new Date(day))) continue;
      const times = localTimes(pattern, day);
      if (direction < 0) times.reverse();
      const around = zone.offsets(day);
      for (const local of times) {
        if (direction * (local - from) < -cronOffsetBoundMs) continue;
        const at = zone.instant(local, around);
        if (at !== undefined && accept(at)) return new Date(at);
      }
    }
    throw new Error(`Cron expression has no occurrence: ${text}`);
  }
  const schedule: CronSchedule = {
    expression: text,
    timeZone: zone.timeZone,
    next(after) {
      const from = checkedTime(after, "start");
      return search(from, 1, (at) => at > from);
    },
    previous(at) {
      const until = checkedTime(at, "end");
      return search(until, -1, (candidate) => candidate <= until);
    },
  };
  search(Date.UTC(2000, 0, 1), 1, () => true);
  return Object.freeze(schedule);
}
