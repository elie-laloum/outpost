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

| Name      | Type                                                | Presence | Meaning                                                                                   |
| --------- | --------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `read`    | `() => Promise<unknown>`                            | Required | Read the saved checkpoint as unknown for validation; return no saved value for a new run. |
| `write`   | `(checkpoint: WorkflowCheckpoint) => Promise<void>` | Required | Atomically persist the supplied workflow checkpoint while owning the lease.               |
| `release` | `() => Promise<void>`                               | Required | Release exclusive ownership of the checkpoint without deleting saved state.               |

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
