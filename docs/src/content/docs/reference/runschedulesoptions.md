---
title: "RunSchedulesOptions"
description: "RunSchedulesOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunSchedulesOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                                | Presence | Meaning                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queue`     | `TaskQueue`                                                         | Required | Queue receiving one trigger job per slot; share it between scheduler replicas so they converge on the same job.                                                                         |
| `schedules` | `readonly TriggerSchedule[]`                                        | Required | At least one schedule, each with a unique name.                                                                                                                                         |
| `signal`    | `AbortSignal`                                                       | Required | Stops every schedule; runSchedules() then resolves.                                                                                                                                     |
| `maxLateMs` | `number \| undefined`                                               | Optional | Maximum delay after a slot for it to still be published, including at startup; defaults to 60000. Older slots are skipped.                                                              |
| `onError`   | `((error: unknown, failure: ScheduleFailure) => void) \| undefined` | Optional | Receives each publication failure with its schedule and slot, and scheduling continues; without it the first failure rejects runSchedules(). Errors thrown by the callback are ignored. |

## Signature

```ts
export interface RunSchedulesOptions {
  readonly queue: TaskQueue;
  readonly schedules: readonly TriggerSchedule[];
  readonly signal: AbortSignal;
  /** Latest publication accepted for a slot, including after a restart; defaults to 60 seconds. */
  readonly maxLateMs?: number;
  /** Receives publication failures; without it, the first failure rejects `runSchedules()`. */
  readonly onError?: (error: unknown, failure: ScheduleFailure) => void;
}
```

## Related contracts

- [ScheduleFailure](../schedulefailure/)
- [TaskQueue](../taskqueue/)
- [TriggerSchedule](../triggerschedule/)
