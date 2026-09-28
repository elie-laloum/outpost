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

| Name             | Type                                                               | Presence | Meaning                                                                                                                        |
| ---------------- | ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `inputRequests`  | `readonly WorkflowInputRequest[]`                                  | Required | Immutable pending questions from tasks in waiting-input; empty when no human input is pending.                                 |
| `executionId`    | `string`                                                           | Required | Identity of the workflow execution, preserved across checkpoint resumption.                                                    |
| `name`           | `string`                                                           | Required | Name of the workflow definition, included in its execution reports.                                                            |
| `status`         | `"failed" \| "waiting-input" \| "done" \| "cancelled" \| "paused"` | Required | Overall outcome; waiting-input takes precedence over paused, while failures and cancellation take precedence over both.        |
| `tasks`          | `readonly Readonly<TaskRecord>[]`                                  | Required | Final task records with statuses, attempt counts, errors and pending gates.                                                    |
| `errors`         | `readonly unknown[]`                                               | Required | Task and scheduling failures collected during the workflow execution.                                                          |
| `observerErrors` | `readonly unknown[]`                                               | Required | Exceptions thrown by telemetry and observe callbacks, collected independently without changing workflow status or task errors. |
| `usage`          | `WorkflowUsage`                                                    | Required | Cumulative admitted attempts and observed token usage, including restored accounting.                                          |
| `value`          | `<T>(task: Task<T>) => T`                                          | Required | Read a successful task’s typed output by task identity; reject unavailable outputs.                                            |
| `unwrap`         | `() => void`                                                       | Required | Return normally for a successful run; throw WorkflowFailure for any other workflow outcome.                                    |

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
