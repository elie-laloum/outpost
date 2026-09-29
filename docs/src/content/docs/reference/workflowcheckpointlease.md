---
title: "WorkflowCheckpointLease"
description: "WorkflowCheckpointLease — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowCheckpointLease } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                | Presence | Meaning                                                                                                                                                                                                                          |
| --------- | --------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `read`    | `() => Promise<unknown>`                            | Required | Returns the saved checkpoint as unvalidated data, or undefined for a new run. start() validates it against the workflow before running any task.                                                                                 |
| `write`   | `(checkpoint: WorkflowCheckpoint) => Promise<void>` | Required | Replaces the saved checkpoint while the lease is held. createWorkflowCheckpointStore() writes conditionally on the last revision, rejecting with TransportConflict once ownership is lost, and rejects checkpoints above 16 MiB. |
| `release` | `() => Promise<void>`                               | Required | Clears ownership once pending writes settle and keeps the saved checkpoint. start() calls it when it returns or rejects.                                                                                                         |

## Signature

```ts
export interface WorkflowCheckpointLease {
  read(): Promise<unknown>;
  write(checkpoint: WorkflowCheckpoint): Promise<void>;
  release(): Promise<void>;
}
```

## Related contracts

- [WorkflowCheckpoint](../workflowcheckpoint/)
