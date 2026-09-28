---
title: "WorkflowEvent"
description: "WorkflowEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                                                                                                                                                             | Presence | Meaning                                                                                                                                                                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `executionId` | `string`                                                                                                                                                                                                         | Required | Identity of the workflow execution, preserved across checkpoint resumption.                                                                                                                                                                           |
| `workflow`    | `string`                                                                                                                                                                                                         | Required | Name of the workflow that emitted this event.                                                                                                                                                                                                         |
| `timestamp`   | `string`                                                                                                                                                                                                         | Required | ISO timestamp when the workflow event was emitted.                                                                                                                                                                                                    |
| `type`        | `"usage" \| "quota" \| "retry" \| "attempt" \| "resume" \| "cache" \| "input-request" \| "input-answer" \| "loop" \| "start" \| "task" \| "finish" \| "gate" \| "decision" \| "checkpoint" \| "budget-exceeded"` | Required | Lifecycle notification, including loop phases, input-request when a task suspends, input-answer when an accepted reply makes it ready to run, quota when a quota error pauses a task or a paused task is released, and cache for task cache outcomes. |
| `cache`       | `TaskCacheOutcome \| undefined`                                                                                                                                                                                  | Optional | Task cache outcome on cache events: hit, miss (absent, expired or refresh mode), stored, or failed when the store or an entry was unusable.                                                                                                           |
| `error`       | `string \| undefined`                                                                                                                                                                                            | Optional | Store or entry error message on failed cache events; the task continues without the cache.                                                                                                                                                            |
| `resetAt`     | `string \| undefined`                                                                                                                                                                                            | Optional | Reported quota reset time on quota events, when the provider supplied one.                                                                                                                                                                            |
| `round`       | `number \| undefined`                                                                                                                                                                                            | Optional | Logical round number on loop phase events.                                                                                                                                                                                                            |
| `phase`       | `"complete" \| "attempt" \| "check" \| undefined`                                                                                                                                                                | Optional | Saved phase on loop events: attempt, check or complete.                                                                                                                                                                                               |
| `key`         | `string \| undefined`                                                                                                                                                                                            | Optional | Stable task key identifying the node within its workflow graph.                                                                                                                                                                                       |
| `status`      | `TaskStatus \| undefined`                                                                                                                                                                                        | Optional | Task lifecycle state, including waiting, active, done, failure, cancellation or gate pause/rejection. On quota events, waiting means the task will run again in this start() call and paused means it stays paused.                                   |
| `attempt`     | `number \| undefined`                                                                                                                                                                                            | Optional | One-based task attempt number.                                                                                                                                                                                                                        |
| `usage`       | `Usage \| undefined`                                                                                                                                                                                             | Optional | Reported usage counters; not a currency estimate.                                                                                                                                                                                                     |
| `durationMs`  | `number \| undefined`                                                                                                                                                                                            | Optional | Elapsed execution time in milliseconds.                                                                                                                                                                                                               |
| `delayMs`     | `number \| undefined`                                                                                                                                                                                            | Optional | Selected wait before the next task attempt, present on retry events and on quota events that wait for a reset in process; includes backoff, jitter and any valid server minimum for retries.                                                          |

## Signature

```ts
export interface WorkflowEvent {
  readonly executionId: string;
  readonly workflow: string;
  readonly timestamp: string;
  readonly type:
    | "cache"
    | "quota"
    | "input-request"
    | "input-answer"
    | "loop"
    | "start"
    | "task"
    | "attempt"
    | "retry"
    | "usage"
    | "finish"
    | "gate"
    | "decision"
    | "checkpoint"
    | "resume"
    | "budget-exceeded";
  readonly cache?: TaskCacheOutcome;
  readonly error?: string;
  readonly resetAt?: string;
  readonly round?: number;
  readonly phase?: "attempt" | "check" | "complete";
  readonly key?: string;
  readonly status?: TaskStatus;
  readonly attempt?: number;
  readonly usage?: Usage;
  readonly durationMs?: number;
  readonly delayMs?: number;
}
```

## Related contracts

- [TaskCacheOutcome](../taskcacheoutcome/)
- [TaskStatus](../taskstatus/)
- [Usage](../usage/)
