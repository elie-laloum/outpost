---
title: "Cron schedules"
description: "Publish a workflow job on a cron schedule, safely across restarts and replicas."
---

`createCronSchedule()` parses a five-field cron expression evaluated in an IANA time zone (UTC by default). `runSchedules()` publishes one job per slot until its signal aborts.

```ts
import {
  createCronSchedule,
  runSchedules,
  createSqliteTaskQueue,
} from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runSchedules({
    queue,
    signal: stop.signal,
    schedules: [
      {
        name: "nightly-audit",
        cron: createCronSchedule("0 2 * * 1-5", { timeZone: "Europe/Paris" }),
        handler: "audit",
        runId: (slot) => `audit-${slot.toISOString().slice(0, 10)}`,
        input: (slot) => ({ day: slot.toISOString().slice(0, 10) }),
      },
    ],
  });
} finally {
  queue.close();
}
```

- **Syntax.** Minute, hour, day of month, month and day of week, with lists (`1,15`), ranges (`1-5`), steps (`*/10`, `8-18/2`), month and weekday names (`JAN`, `MON-FRI`), `7` for Sunday and the macros `@hourly`, `@daily`, `@weekly`, `@monthly` and `@yearly`. As in Vixie cron, when both day fields are restricted a day matching either one fires. There is no seconds field.
- **Daylight saving time.** Slots are wall-clock times. A time skipped by a spring-forward change does not fire; a time repeated in autumn fires once, at its first occurrence.
- **Job identity.** Each slot publishes the job `schedule:<name>:<slot ISO time>`. Two schedulers sharing a queue, or a restarted one, publish the same job and the queue keeps a single copy. `runId` defaults to `<name>:<slot ISO time>` and `input` to `null`.
- **Late slots.** A slot is published only if at most `maxLateMs` (60 seconds by default) has passed. After a restart or a suspended process, only the latest missed slot within that window is published; older slots are skipped rather than replayed in a burst.
- **Failures.** Without `onError`, the first publication failure rejects `runSchedules()`. With it, the failure is reported with the schedule and slot, and scheduling continues.

`createCronSchedule()` rejects an expression that has no occurrence, such as `0 0 30 2 *`. Its `next()` and `previous()` methods compute slots without publishing anything:

```ts
import { createCronSchedule } from "@elie-laloum/outpost";

const nightly = createCronSchedule("30 2 * * *", { timeZone: "Europe/Paris" });
console.log(nightly.next(new Date("2026-03-28T12:00:00Z")).toISOString());
```

<!-- check:run -->

This prints `2026-03-30T00:30:00.000Z`: 02:30 does not exist in Paris on 29 March 2026.

A CI schedule, such as a GitHub Actions `schedule` workflow running a script, is an alternative when no long-running process is available.
