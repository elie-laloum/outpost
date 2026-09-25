---
title: "WorkflowCheckpointOptions"
description: "WorkflowCheckpointOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowCheckpointOptions**. See the [workflow checkpoints guide](../../guide/advanced/checkpoints/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowCheckpointOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Persist lossless task results and explicitly reopen the same graph across process restarts.

Completed outputs are not replayed. Interrupted ordinary tasks require retry-incomplete authorization. Outputs must be lossless JSON; full dispatch results contain functions and cannot be checkpointed directly.

[Complete example and detailed rules](../../guide/advanced/checkpoints/).

## Parameters and properties

| Name      | Type                              | Presence | Meaning                                                                 |
| --------- | --------------------------------- | -------- | ----------------------------------------------------------------------- |
| `store`   | `WorkflowCheckpointStore`         | Required | Caller-supplied persistence implementation.                             |
| `runId`   | `string`                          | Required | Stable identity of a saved workflow execution.                          |
| `version` | `string`                          | Required | Caller-controlled contract or graph version.                            |
| `resume`  | `"retry-incomplete" \| undefined` | Optional | Explicitly authorize replay of incomplete tasks and their side effects. |

## Signature

```ts
export interface WorkflowCheckpointOptions {
  readonly store: WorkflowCheckpointStore;
  readonly runId: string;
  /** Change when task implementations or workflow inputs change. */
  readonly version: string;
  /** Explicitly authorize replay of incomplete tasks and their side effects. */
  readonly resume?: "retry-incomplete";
}
```

## Related contracts

- [WorkflowCheckpointStore](../workflowcheckpointstore/)
