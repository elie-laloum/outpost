---
title: "WorkflowResult"
description: "WorkflowResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                                               | Presence | Meaning                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inputRequests`  | `readonly WorkflowInputRequest[]`                                  | Required | Immutable pending questions from tasks in waiting-input; empty when no human input is pending.                                                                                           |
| `executionId`    | `string`                                                           | Required | Identity of the workflow execution, preserved across checkpoint resumption.                                                                                                              |
| `name`           | `string`                                                           | Required | Name of the workflow definition, included in its execution reports.                                                                                                                      |
| `status`         | `"failed" \| "done" \| "cancelled" \| "waiting-input" \| "paused"` | Required | Run outcome: done, paused (gate or quota), waiting-input, failed or cancelled. Precedence is cancelled, then failed, then waiting-input, then paused; an expired timeoutMs gives failed. |
| `tasks`          | `readonly Readonly<TaskRecord>[]`                                  | Required | One frozen record per task, in list order, with status, attempts, timestamps and error.                                                                                                  |
| `errors`         | `readonly unknown[]`                                               | Required | Errors that failed the run: task failures, gate rejections, budget errors and the abort or timeout reason.                                                                               |
| `observerErrors` | `readonly unknown[]`                                               | Required | Exceptions thrown by telemetry and observe callbacks, collected independently without changing workflow status or task errors.                                                           |
| `usage`          | `WorkflowUsage`                                                    | Required | Cumulative admitted attempts and observed token usage, including restored accounting.                                                                                                    |
| `value`          | `<T>(task: Task<T>) => T`                                          | Required | Return a task's output from this run or its restored checkpoint; throws when the task has no done value.                                                                                 |
| `unwrap`         | `() => void`                                                       | Required | Return when status is done; otherwise throw WorkflowFailure.                                                                                                                             |

## Signature

```ts
export interface WorkflowResult {
  readonly inputRequests: readonly WorkflowInputRequest[];
  readonly executionId: string;
  readonly name: string;
  readonly status: "done" | "failed" | "cancelled" | "paused" | "waiting-input";
  readonly tasks: readonly Readonly<TaskRecord>[];
  readonly errors: readonly unknown[];
  readonly observerErrors: readonly unknown[];
  readonly usage: WorkflowUsage;
  value<T>(task: Task<T>): T;
  unwrap(): void;
}
```

## Related contracts

- [Task](../type-task/)
- [TaskRecord](../taskrecord/)
- [WorkflowInputRequest](../workflowinputrequest/)
- [WorkflowUsage](../workflowusage/)
