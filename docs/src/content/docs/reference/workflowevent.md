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

| Name          | Type                                                               | Presence | Meaning                                                                                               |
| ------------- | ------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------- |
| `executionId` | `string`                                                           | Required | Identity of the workflow execution, preserved across checkpoint resumption.                           |
| `workflow`    | `string`                                                           | Required | Name of the workflow that emitted this event.                                                         |
| `timestamp`   | `string`                                                           | Required | ISO timestamp when the workflow event was emitted.                                                    |
| `type`        | `"usage" \| "retry" \| "start" \| "task" \| "attempt" \| "finish"` | Required | Event category: run start/finish, task transition, attempt, retry or usage report.                    |
| `key`         | `string \| undefined`                                              | Optional | Stable task key identifying the node within its workflow graph.                                       |
| `status`      | `TaskStatus \| undefined`                                          | Optional | Task lifecycle state, including waiting, active, done, failure, cancellation or gate pause/rejection. |
| `attempt`     | `number \| undefined`                                              | Optional | One-based task attempt number.                                                                        |
| `usage`       | `Usage \| undefined`                                               | Optional | Reported usage counters; not a currency estimate.                                                     |
| `durationMs`  | `number \| undefined`                                              | Optional | Elapsed execution time in milliseconds.                                                               |

## Signature

```ts
export interface WorkflowEvent {
  readonly executionId: string;
  readonly workflow: string;
  readonly timestamp: string;
  readonly type: "start" | "task" | "attempt" | "retry" | "usage" | "finish";
  readonly key?: string;
  readonly status?: TaskStatus;
  readonly attempt?: number;
  readonly usage?: Usage;
  readonly durationMs?: number;
}
```

## Related contracts

- [TaskStatus](../taskstatus/)
- [Usage](../usage/)
