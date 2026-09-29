import assert from "node:assert/strict";
import { test } from "node:test";
import { createCronSchedule } from "../../src/index.ts";

function next(expression: string, after: string, timeZone?: string) {
  return createCronSchedule(expression, timeZone ? { timeZone } : {})
    .next(new Date(after))
    .toISOString();
}

test("cron fields accept lists, ranges, steps, names and macros", () => {
  assert.equal(
    next("*/15 * * * *", "2026-09-29T10:07:30Z"),
    "2026-09-29T10:15:00.000Z",
  );
  assert.equal(
    next("5,10-12 9 * * *", "2026-09-29T09:10:00Z"),
    "2026-09-29T09:11:00.000Z",
  );
  assert.equal(
    next("0 9 * * MON-FRI", "2026-09-26T00:00:00Z"),
    "2026-09-28T09:00:00.000Z",
  );
  assert.equal(
    next("0 0 1 jan,Jul *", "2026-02-01T00:00:00Z"),
    "2026-07-01T00:00:00.000Z",
  );
  assert.equal(
    next("30 1/6 * * *", "2026-09-29T08:00:00Z"),
    "2026-09-29T13:30:00.000Z",
  );
  assert.equal(
    next("0 0 * * 7", "2026-09-29T00:00:00Z"),
    "2026-10-04T00:00:00.000Z",
  );
  assert.equal(createCronSchedule("  @Daily ").expression, "0 0 * * *");
  assert.equal(
    next("@hourly", "2026-09-29T10:00:00Z"),
    "2026-09-29T11:00:00.000Z",
  );
  assert.equal(createCronSchedule("0 3  * *\t*").expression, "0 3 * * *");
});

test("cron day fields follow Vixie semantics", () => {
  assert.equal(
    next("0 0 1,15 * MON", "2026-09-01T00:00:01Z"),
    "2026-09-07T00:00:00.000Z",
    "restricted day and weekday match either field",
  );
  assert.equal(
    next("0 0 */2 * MON", "2026-09-01T00:00:01Z"),
    "2026-09-07T00:00:00.000Z",
    "a starred day field requires both",
  );
  assert.equal(
    next("0 0 13 * FRI", "2026-09-01T00:00:00Z"),
    "2026-09-04T00:00:00.000Z",
  );
});

test("cron finds rare slots and rejects impossible ones", () => {
  assert.equal(
    next("0 0 29 2 *", "2096-03-01T00:00:00Z"),
    "2104-02-29T00:00:00.000Z",
  );
  assert.throws(() => createCronSchedule("0 0 30 2 *"), /no occurrence/);
  for (const invalid of [
    "",
    "* * * *",
    "* * * * * *",
    "60 * * * *",
    "* 24 * * *",
    "* * 0 * *",
    "* * * 13 *",
    "* * * * 8",
    "*/0 * * * *",
    "*/ * * * *",
    "5-1 * * * *",
    "1-2-3 * * * *",
    "1/2/3 * * * *",
    "a * * * *",
    ", * * * *",
    "0 0 * FOO *",
  ])
    assert.throws(() => createCronSchedule(invalid), Error, invalid);
  assert.throws(
    () => createCronSchedule("x".repeat(300)),
    /Invalid cron expression/,
  );
  assert.throws(
    () => createCronSchedule("* * * * *", { timeZone: "Mars/Olympus" }),
    /time zone/,
  );
  assert.throws(
    () => createCronSchedule("* * * * *").next(new Date(Number.NaN)),
    /date/,
  );
});

test("cron evaluates wall-clock time across daylight saving changes", () => {
  const paris = createCronSchedule("30 2 * * *", { timeZone: "Europe/Paris" });
  assert.equal(paris.timeZone, "Europe/Paris");
  assert.equal(
    paris.next(new Date("2026-03-28T12:00:00Z")).toISOString(),
    "2026-03-30T00:30:00.000Z",
    "a skipped local time does not fire",
  );
  assert.equal(
    paris.next(new Date("2026-10-24T12:00:00Z")).toISOString(),
    "2026-10-25T00:30:00.000Z",
  );
  assert.equal(
    paris.next(new Date("2026-10-25T00:30:00Z")).toISOString(),
    "2026-10-26T01:30:00.000Z",
    "a repeated local time fires once",
  );
  assert.equal(
    paris.previous(new Date("2026-10-25T01:45:00Z")).toISOString(),
    "2026-10-25T00:30:00.000Z",
  );
  const york = createCronSchedule("0 9 * * *", {
    timeZone: "America/New_York",
  });
  assert.equal(
    york.next(new Date("2026-07-01T00:00:00Z")).toISOString(),
    "2026-07-01T13:00:00.000Z",
  );
  assert.equal(
    york.next(new Date("2026-12-01T00:00:00Z")).toISOString(),
    "2026-12-01T14:00:00.000Z",
  );
});

test("cron previous returns the latest slot at or before a time", () => {
  const every = createCronSchedule("*/10 * * * *");
  assert.equal(
    every.previous(new Date("2026-09-29T10:20:00Z")).toISOString(),
    "2026-09-29T10:20:00.000Z",
  );
  assert.equal(
    every.previous(new Date("2026-09-29T10:29:59Z")).toISOString(),
    "2026-09-29T10:20:00.000Z",
  );
  assert.equal(
    createCronSchedule("0 0 1 1 *")
      .previous(new Date("2026-09-29T00:00:00Z"))
      .toISOString(),
    "2026-01-01T00:00:00.000Z",
  );
  assert.ok(Object.isFrozen(every));
});
