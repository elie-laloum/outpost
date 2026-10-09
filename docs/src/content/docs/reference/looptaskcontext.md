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

| Name                  | Type                                                     | Presence | Meaning                                                                                                                                                                               |
| --------------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `round`               | `number`                                                 | Required | One-based logical round number, stable when an interrupted phase is replayed.                                                                                                         |
| `phase`               | `"attempt" \| "check"`                                   | Required | Current callback phase: attempt produces a candidate; check verifies it.                                                                                                              |
| `workspaceCheckpoint` | `TaskWorkspaceCheckpoint \| undefined`                   | Optional | Optional domain access to JSON workspace descriptions; file allocation and snapshots remain application responsibilities.                                                             |
| `prices`              | `ModelPriceTable \| undefined`                           | Optional | Workflow price table, forwarded by built-in agent task helpers. Custom dispatches must pass this explicitly to collect model counters.                                                |
| `quota`               | `WorkflowQuotaPause \| undefined`                        | Optional | Quota pause resumed by this attempt, with the captured conversation and retained branch when known; present only on the first attempt after the pause and never persisted separately. |
| `interaction`         | `TaskInteractionContext \| undefined`                    | Optional | Durable state and suspension operations, supplied only for tasks declaring an interaction.                                                                                            |
| `idempotencyKey`      | `string`                                                 | Required | Effect key scoped to execution, task, logical round and phase; stable across replay of that phase. External deduplication remains caller-owned.                                       |
| `observation`         | `ObservationHub \| undefined`                            | Optional | Task-scoped hub with workflow execution, task key and attempt; pass it to custom nested work such as speculate.                                                                       |
| `signal`              | `AbortSignal`                                            | Required | Aborted when the workflow stops or this round's timeoutMs expires.                                                                                                                    |
| `attempt`             | `number`                                                 | Required | Cumulative workflow attempt number for this loop, incremented for new rounds and replayed phases. Both callbacks in an uninterrupted round share it.                                  |
| `executionId`         | `string`                                                 | Required | Identity of the workflow execution, preserved across checkpoint resumption.                                                                                                           |
| `reportUsage`         | `(usage: Usage) => void`                                 | Required | Synchronously add usage from this phase to the workflow budget, including failed model requests. Usage is not inferred from arbitrary callback results.                               |
| `reportUsageOnce`     | `((receipt: string, usage: Usage) => void) \| undefined` | Optional | Deduplicate a durable usage receipt within this task. Scope receipts to each distinct charged operation; a replayed paid request requires a new receipt.                              |
| `checkpoint`          | `(() => Promise<void>) \| undefined`                     | Optional | Save the workflow state now; does nothing without a checkpoint.                                                                                                                       |
| `value`               | `<T>(dependency: Task<T>) => T`                          | Required | Read the completed output of a task listed in this task’s declared dependencies.                                                                                                      |

## Signature

```ts
export interface LoopTaskContext extends TaskContext {
  readonly round: number;
  readonly phase: "attempt" | "check";
}
```

## Related contracts

- [TaskContext](../taskcontext/)
