---
title: "LoopTaskContext"
description: "LoopTaskContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LoopTaskContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                                                     | Presence | Meaning                                                                                                                                                  |
| ----------------- | -------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `round`           | `number`                                                 | Required | One-based logical round number, stable when an interrupted phase is replayed.                                                                            |
| `phase`           | `"attempt" \| "check"`                                   | Required | Current callback phase: attempt produces a candidate; check verifies it.                                                                                 |
| `idempotencyKey`  | `string`                                                 | Required | Effect key scoped to execution, task, logical round and phase; stable across replay of that phase. External deduplication remains caller-owned.          |
| `observation`     | `ObservationHub \| undefined`                            | Optional | Task-scoped hub with workflow execution, task key and attempt; pass it to custom nested work such as speculate.                                          |
| `signal`          | `AbortSignal`                                            | Required | Cooperative cancellation for this operation.                                                                                                             |
| `attempt`         | `number`                                                 | Required | Cumulative workflow attempt number for this loop, incremented for new rounds and replayed phases. Both callbacks in an uninterrupted round share it.     |
| `executionId`     | `string`                                                 | Required | Identity of the workflow execution, preserved across checkpoint resumption.                                                                              |
| `reportUsage`     | `(usage: Usage) => void`                                 | Required | Synchronously add usage from this phase to the workflow budget, including failed model requests. Usage is not inferred from arbitrary callback results.  |
| `reportUsageOnce` | `((receipt: string, usage: Usage) => void) \| undefined` | Optional | Deduplicate a durable usage receipt within this task. Scope receipts to each distinct charged operation; a replayed paid request requires a new receipt. |
| `checkpoint`      | `(() => Promise<void>) \| undefined`                     | Optional | Persist the current workflow state when durable execution is enabled.                                                                                    |
| `value`           | `<T>(dependency: Task<T>) => T`                          | Required | Read the completed output of a task listed in this task’s declared dependencies.                                                                         |

## Signature

```ts
export interface LoopTaskContext extends TaskContext {
  readonly round: number;
  readonly phase: "attempt" | "check";
}
```

## Related contracts

- [TaskContext](../taskcontext/)
