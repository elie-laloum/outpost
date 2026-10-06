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

| Name              | Type                                                                             | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `terminationCode` | `WorkflowTerminationCode \| undefined`                                           | Optional | Reason for an unsuccessful terminal outcome: rejected for a gate refusal, aborted for external cancellation, timeout for a task or workflow deadline, limit for an exhausted workflow budget, usage-unavailable for incomplete budget accounting, the first technical failure’s OutpostError code (including wrapped causes), or failed for an unclassified error. Absent for done, paused and waiting-input; recomputed from restored gate records on resume. |
| `inputRequests`   | `readonly WorkflowInputRequest[]`                                                | Required | Immutable pending questions from tasks in waiting-input; empty when no human input is pending.                                                                                                                                                                                                                                                                                                                                                                 |
| `executionId`     | `string`                                                                         | Required | Identity of the workflow execution, preserved across checkpoint resumption.                                                                                                                                                                                                                                                                                                                                                                                    |
| `name`            | `string`                                                                         | Required | Name of the workflow definition, included in its execution reports.                                                                                                                                                                                                                                                                                                                                                                                            |
| `status`          | `"failed" \| "done" \| "cancelled" \| "rejected" \| "waiting-input" \| "paused"` | Required | Run outcome: done, failed, cancelled, rejected, paused (gate or quota), or waiting-input. External cancellation or the workflow deadline takes precedence, then technical failure, rejection, waiting-input and pause. A workflow deadline gives failed with terminationCode timeout.                                                                                                                                                                          |
| `tasks`           | `readonly Readonly<TaskRecord>[]`                                                | Required | One frozen record per task, in list order, with status, attempts, timestamps and error.                                                                                                                                                                                                                                                                                                                                                                        |
| `errors`          | `readonly unknown[]`                                                             | Required | Task failures, gate rejections, budget errors and the external abort or timeout reason. Gate rejection uses OutpostError code rejected and retains the task key, actor and reason in details; rejected runs keep this audit trail after checkpoint resumption.                                                                                                                                                                                                 |
| `observerErrors`  | `readonly unknown[]`                                                             | Required | Exceptions thrown by telemetry and observe callbacks, collected independently without changing workflow status or task errors.                                                                                                                                                                                                                                                                                                                                 |
| `usage`           | `WorkflowUsage`                                                                  | Required | Cumulative admitted attempts and observed token usage, including restored accounting.                                                                                                                                                                                                                                                                                                                                                                          |
| `value`           | `<T>(task: Task<T>) => T`                                                        | Required | Return a task's output from this run or its restored checkpoint; throws when the task has no done value.                                                                                                                                                                                                                                                                                                                                                       |
| `unwrap`          | `() => void`                                                                     | Required | Return when status is done; otherwise throw WorkflowFailure.                                                                                                                                                                                                                                                                                                                                                                                                   |

## Signature

```ts
export interface WorkflowResult {
  readonly terminationCode?: WorkflowTerminationCode;
  readonly inputRequests: readonly WorkflowInputRequest[];
  readonly executionId: string;
  readonly name: string;
  readonly status:
    "done" | "failed" | "cancelled" | "paused" | "waiting-input" | "rejected";
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
- [WorkflowTerminationCode](../workflowterminationcode/)
- [WorkflowUsage](../workflowusage/)
