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

| Name         | Type                              | Presence | Meaning                                                                                                                                                                                                                        |
| ------------ | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workspaces` | `true \| undefined`               | Optional | Opt-in versioned file resource capability; older providers and checkpoints preserve their Git contract.                                                                                                                        |
| `store`      | `WorkflowCheckpointStore`         | Required | Store that grants exclusive ownership of the run and reads and writes its checkpoint, usually createWorkflowCheckpointStore().                                                                                                 |
| `runId`      | `string`                          | Required | Key of the saved run: a later start() with the same runId restores it. Blank values are rejected.                                                                                                                              |
| `version`    | `string`                          | Required | Your version of task code, briefs and inputs, hashed into the checkpoint identity with the workflow name and task graph. A saved run cannot change version: start a new runId instead.                                         |
| `resume`     | `"retry-incomplete" \| undefined` | Optional | Set to retry-incomplete to reopen a checkpoint with failed, cancelled or interrupted tasks and run them again, with any side effects they already made. Without it, start() rejects such a checkpoint before running anything. |

## Signature

```ts
export interface WorkflowCheckpointOptions {
  readonly workspaces?: true;
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
