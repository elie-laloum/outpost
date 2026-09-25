---
title: "WorkflowCheckpointOptions"
description: "WorkflowCheckpointOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowCheckpointOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                              | Presence | Meaning                                                                                              |
| --------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `store`   | `WorkflowCheckpointStore`         | Required | Persistence adapter that acquires, reads and writes workflow checkpoints.                            |
| `runId`   | `string`                          | Required | Stable identity of a saved workflow execution.                                                       |
| `version` | `string`                          | Required | Caller-supplied graph/implementation version; change it when task code or workflow inputs change.    |
| `resume`  | `"retry-incomplete" \| undefined` | Optional | Explicit retry-incomplete authorization to replay interrupted tasks and their possible side effects. |

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
