---
title: "TaskContext"
description: "TaskContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                                                     | Presence | Meaning                                                                                                                                                          |
| ----------------- | -------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interaction`     | `TaskInteractionContext \| undefined`                    | Optional | Durable state and suspension operations, supplied only for tasks declaring an interaction.                                                                       |
| `idempotencyKey`  | `string`                                                 | Required | Stable SHA-256 identity of executionId and task key, preserved across retries and checkpoint replay. Pass it to an effect service with persistent deduplication. |
| `observation`     | `ObservationHub \| undefined`                            | Optional | Task-scoped hub with workflow execution, task key and attempt; pass it to custom nested work such as speculate.                                                  |
| `signal`          | `AbortSignal`                                            | Required | Cooperative cancellation for this operation.                                                                                                                     |
| `attempt`         | `number`                                                 | Required | One-based task attempt number.                                                                                                                                   |
| `executionId`     | `string`                                                 | Required | Identity of the workflow execution, preserved across checkpoint resumption.                                                                                      |
| `reportUsage`     | `(usage: Usage) => void`                                 | Required | Add token usage observed during this task attempt to the workflow’s cumulative accounting.                                                                       |
| `reportUsageOnce` | `((receipt: string, usage: Usage) => void) \| undefined` | Optional | Add token usage only if the receipt ID has not already been recorded, including across checkpoint resumes.                                                       |
| `checkpoint`      | `(() => Promise<void>) \| undefined`                     | Optional | Persist the current workflow state when durable execution is enabled.                                                                                            |
| `value`           | `<T>(dependency: Task<T>) => T`                          | Required | Read the completed output of a task listed in this task’s declared dependencies.                                                                                 |

## Signature

```ts
export interface TaskContext {
  readonly interaction?: TaskInteractionContext;
  readonly idempotencyKey: string;
  readonly observation?: ObservationHub;
  readonly signal: AbortSignal;
  readonly attempt: number;
  readonly executionId: string;
  reportUsage(usage: Usage): void;
  reportUsageOnce?(receipt: string, usage: Usage): void;
  checkpoint?(): Promise<void>;
  value<T>(dependency: Task<T>): T;
}
```

## Related contracts

- [ObservationHub](../observationhub/)
- [Task](../type-task/)
- [TaskInteractionContext](../taskinteractioncontext/)
- [Usage](../usage/)
