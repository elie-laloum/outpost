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

| Name                  | Type                                                     | Presence | Meaning                                                                                                                                                                               |
| --------------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspaceCheckpoint` | `TaskWorkspaceCheckpoint \| undefined`                   | Optional | Optional domain access to JSON workspace descriptions; file allocation and snapshots remain application responsibilities.                                                             |
| `prices`              | `ModelPriceTable \| undefined`                           | Optional | Workflow price table, forwarded by built-in agent task helpers. Custom dispatches must pass this explicitly to collect model counters.                                                |
| `quota`               | `WorkflowQuotaPause \| undefined`                        | Optional | Quota pause resumed by this attempt, with the captured conversation and retained branch when known; present only on the first attempt after the pause and never persisted separately. |
| `interaction`         | `TaskInteractionContext \| undefined`                    | Optional | Durable state and suspension operations, supplied only for tasks declaring an interaction.                                                                                            |
| `idempotencyKey`      | `string`                                                 | Required | Stable SHA-256 identity of executionId and task key, preserved across retries and checkpoint replay. Pass it to an effect service with persistent deduplication.                      |
| `observation`         | `ObservationHub \| undefined`                            | Optional | Task-scoped hub with workflow execution, task key and attempt; pass it to custom nested work such as speculate.                                                                       |
| `signal`              | `AbortSignal`                                            | Required | Aborted when the workflow is cancelled, stops on an error or times out, or when this attempt's timeoutMs expires.                                                                     |
| `attempt`             | `number`                                                 | Required | One-based attempt number, cumulative across retries and checkpoint resumes; 0 in condition and cache key callbacks.                                                                   |
| `executionId`         | `string`                                                 | Required | Identity of the workflow execution, preserved across checkpoint resumption.                                                                                                           |
| `reportUsage`         | `(usage: Usage) => void`                                 | Required | Add token usage to the workflow budget; throws outside the active attempt. Agent task definitions report their usage themselves.                                                      |
| `reportUsageOnce`     | `((receipt: string, usage: Usage) => void) \| undefined` | Optional | Add token usage only if the receipt ID has not already been recorded, including across checkpoint resumes.                                                                            |
| `checkpoint`          | `(() => Promise<void>) \| undefined`                     | Optional | Save the workflow state now; does nothing without a checkpoint.                                                                                                                       |
| `value`               | `<T>(dependency: Task<T>) => T`                          | Required | Return the output of a task listed in after; throws for an undeclared dependency.                                                                                                     |

## Signature

```ts
export interface TaskContext {
  readonly workspaceCheckpoint?: TaskWorkspaceCheckpoint;
  readonly prices?: ModelPriceTable;
  /** Quota pause resumed by this attempt; present only on the first attempt after it. */
  readonly quota?: WorkflowQuotaPause;
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

- [ModelPriceTable](../modelpricetable/)
- [ObservationHub](../observationhub/)
- [Task](../type-task/)
- [TaskInteractionContext](../taskinteractioncontext/)
- [Usage](../usage/)
- [WorkflowQuotaPause](../workflowquotapause/)
