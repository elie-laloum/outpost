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

| Name             | Type                                            | Presence | Meaning                                                                                     |
| ---------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `executionId`    | `string`                                        | Required | Identity of the workflow execution, preserved across checkpoint resumption.                 |
| `name`           | `string`                                        | Required | Name of the workflow definition, included in its execution reports.                         |
| `status`         | `"done" \| "failed" \| "cancelled" \| "paused"` | Required | Overall execution outcome: done, failed, cancelled or paused.                               |
| `tasks`          | `readonly Readonly<TaskRecord>[]`               | Required | Final task records with statuses, attempt counts, errors and pending gates.                 |
| `errors`         | `readonly unknown[]`                            | Required | Task and scheduling failures collected during the workflow execution.                       |
| `observerErrors` | `readonly unknown[]`                            | Required | Observer callback failures isolated from task outcomes.                                     |
| `usage`          | `WorkflowUsage`                                 | Required | Cumulative admitted attempts and observed token usage, including restored accounting.       |
| `value`          | `<T>(task: Task<T>) => T`                       | Required | Read a successful task’s typed output by task identity; reject unavailable outputs.         |
| `unwrap`         | `() => void`                                    | Required | Return normally for a successful run; throw WorkflowFailure for any other workflow outcome. |

## Signature

```ts
export interface WorkflowResult {
  readonly executionId: string;
  readonly name: string;
  readonly status: "done" | "failed" | "cancelled" | "paused";
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
- [WorkflowUsage](../workflowusage/)
