---
title: "WorkflowCheckpointStore"
description: "WorkflowCheckpointStore — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowCheckpointStore } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                  | Presence | Meaning                                                                |
| --------- | ----------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `acquire` | `(runId: string) => Promise<WorkflowCheckpointLease>` | Required | Acquire exclusive checkpoint ownership for the supplied stable run ID. |

## Signature

```ts
export interface WorkflowCheckpointStore {
  acquire(runId: string): Promise<WorkflowCheckpointLease>;
}
```

## Related contracts

- [WorkflowCheckpointLease](../workflowcheckpointlease/)
