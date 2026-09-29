---
title: "runSchedules"
description: "runSchedules — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { runSchedules } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish one trigger job per cron slot of each schedule until the signal aborts, then resolve. Each slot enqueues schedule:<name>:<slot ISO time>, so replicas and restarts sharing a queue converge on one job; a slot later than maxLateMs is skipped and only the latest missed slot is caught up. Without onError, the first publication failure rejects.

[Complete example and detailed rules](../../guide/webhooks/).

## Parameters and properties

| Name                | Type                                                                | Presence | Meaning                                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `RunSchedulesOptions`                                               | Required | Queue, schedules, stop signal and lateness policy.                                                                                                                                      |
| `options.queue`     | `TaskQueue`                                                         | Required | Queue receiving one trigger job per slot; share it between scheduler replicas so they converge on the same job.                                                                         |
| `options.schedules` | `readonly TriggerSchedule[]`                                        | Required | At least one schedule, each with a unique name.                                                                                                                                         |
| `options.signal`    | `AbortSignal`                                                       | Required | Stops every schedule; runSchedules() then resolves.                                                                                                                                     |
| `options.maxLateMs` | `number \| undefined`                                               | Optional | Maximum delay after a slot for it to still be published, including at startup; defaults to 60000. Older slots are skipped.                                                              |
| `options.onError`   | `((error: unknown, failure: ScheduleFailure) => void) \| undefined` | Optional | Receives each publication failure with its schedule and slot, and scheduling continues; without it the first failure rejects runSchedules(). Errors thrown by the callback are ignored. |

## Returns

`Promise<void>`

## Signature

```ts
export declare function runSchedules(
  options: RunSchedulesOptions,
): Promise<void>;
```

## Related contracts

- [RunSchedulesOptions](../runschedulesoptions/)
