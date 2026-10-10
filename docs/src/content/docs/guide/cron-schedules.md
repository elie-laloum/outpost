---
title: "Schedule recurring runs"
description: "Publish workflow jobs on a cron schedule with an explicit time zone."
---

## Publish a job on a schedule

Create a schedule with `createCronSchedule()` and give it a cron expression and time zone. `runSchedules()` publishes a queue job at each matching time until you abort its signal; a worker runs the job separately.

<!-- tabs -->

```ts title="audit-schedule.ts"
import { createCronSchedule } from "@elie-laloum/outpost";

export const timeZone = "Europe/Paris";
export const day = (slot: Date) =>
  slot.toLocaleDateString("en-CA", { timeZone });
export const schedules = [
  {
    name: "nightly-audit",
    cron: createCronSchedule("0 2 * * 1-5", { timeZone }),
    handler: "audit",
    runId: (slot: Date) => `audit-${day(slot)}`,
    input: (slot: Date) => ({ day: day(slot) }),
  },
];
```

```ts title="scheduler.ts"
import { createSqliteTaskQueue, runSchedules } from "@elie-laloum/outpost";
import { schedules } from "./audit-schedule.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runSchedules({ queue, signal: stop.signal, schedules });
} finally {
  queue.close();
}
```

### Run the script

At 02:00 Paris time, Monday to Friday, the scheduler publishes a job for the `audit` handler with a `runId` such as `audit-2026-09-30`. Ctrl+C aborts the signal and `runSchedules()` resolves.

```sh
node scheduler.ts
```

API reference: [CronOptions](../../reference/cronoptions/).

## Run the published jobs

A worker opens the same queue and registers `audit` with `defineWorkflowJob()`, which runs one checkpointed workflow per `runId`: see [Job queues and workers](../job-queues/). The [Nightly maintenance](../nightly-maintenance/) recipe shows the scheduler and the worker together.

## Write the cron expression

Use five fields in minute, hour, day-of-month, month and day-of-week order. For example, `0 2 * * 1-5` schedules 02:00 on weekdays; `@daily` schedules midnight. Set `timeZone` explicitly when the local time matters. The [createCronSchedule contract](../../reference/createcronschedule/) lists names, ranges, steps, macros and the rule for combining both day fields.

## Name each run after its local date

`slot.toISOString().slice(0, 10)` gives the UTC date. At 01:00 in Paris, that is still the previous day.

Use `slot.toLocaleDateString("en-CA", { timeZone })` with the schedule's time zone, as in the first snippet, to get the local date as `YYYY-MM-DD`.

## Daylight saving time

Slots are wall-clock times in the schedule's time zone.

- **Skipped time**: A time that does not exist on the spring-forward day does not fire that day.
- **Repeated time**: A time that occurs twice on the fall-back day fires once, at its first occurrence.

:::caution
Choose a time outside the local transition hour (02:00–03:00 in Europe) when a job must run every day.
:::

## Run several schedulers

Each slot publishes the job `schedule:<name>:<slot ISO time>`. A restarted scheduler, or several replicas sharing one queue, publish the same job ID, and the queue keeps a single job.

`runId` and `input` must depend only on the slot. The queue rejects a second publication of the same ID with a different request.

Two schedules can return the same `runId` for one day: the second job then reuses the same checkpointed run if its `input` is the same (a different input fails with an incompatible checkpoint), like the 07:00 resume in [Nightly maintenance](../nightly-maintenance/).

## Catch up after a restart

A slot is published only if at most `maxLateMs` has passed since it (60 000 ms by default). After a restart or a suspended process, only the latest missed slot within that window is published; older ones are skipped.

Raise `maxLateMs` to catch up a slot missed during a longer outage, for example `maxLateMs: 6 * 60 * 60_000` for six hours.

## Handle publication failures

Without `onError`, the first failed publication stops every schedule and rejects `runSchedules()`. With it, you receive the error with the schedule name and slot, and scheduling continues with the next slot.

```ts
import { runSchedules } from "@elie-laloum/outpost";
import type { TaskQueue, TriggerSchedule } from "@elie-laloum/outpost";

function schedule(
  queue: TaskQueue,
  schedules: TriggerSchedule[],
  signal: AbortSignal,
) {
  return runSchedules({
    queue,
    schedules,
    signal,
    onError: (error, { schedule, slot }) =>
      console.error(`${schedule} ${slot.toISOString()}`, error),
  });
}
```

A failed slot is not published again. Errors thrown by `onError` are ignored.

## Compute slots without publishing

`next(after)` returns the first slot strictly after a date, `previous(at)` the latest slot at or before it. Neither publishes anything.

```ts
import { createCronSchedule } from "@elie-laloum/outpost";

const nightly = createCronSchedule("30 2 * * *", { timeZone: "Europe/Paris" });
console.log(nightly.next(new Date("2026-03-28T12:00:00Z")).toISOString());
// Example output: 2026-03-30T00:30:00.000Z
```

<!-- check:run -->

This prints `2026-03-30T00:30:00.000Z`: 02:30 does not exist in Paris on 29 March 2026.

`createCronSchedule()` throws on an invalid field, an unknown time zone or an expression with no occurrence, such as `0 0 30 2 *`.

## Schedule from CI instead

Without a long-running process, a scheduled CI job, such as a GitHub Actions `schedule` workflow, can start the workflow directly with a checkpoint. See [Run in CI](../ci-automation/).

## File workspaces

A file recipe uses the same schedule-to-queue contract: a timer only publishes its deterministic job, and the worker allocates the workspace. See [file workspaces](../workspaces/) and [recipe services](../recipe-services/).

## Limits

- The finest resolution is one minute.
- After downtime, only the latest missed slot within `maxLateMs` is published.
- A schedule `name` is unique and uses letters, digits, `.`, `_` and `-` (128 characters at most). A `runId` has at most 256 characters.

API: [createCronSchedule](../../reference/createcronschedule/) · [runSchedules](../../reference/runschedules/) · [TriggerSchedule](../../reference/triggerschedule/) · [CronSchedule](../../reference/cronschedule/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
