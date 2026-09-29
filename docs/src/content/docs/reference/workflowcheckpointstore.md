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

| Name      | Type                                                  | Presence | Meaning                                                                                                                                                                                                          |
| --------- | ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `acquire` | `(runId: string) => Promise<WorkflowCheckpointLease>` | Required | Takes exclusive ownership of runId and returns its lease. createWorkflowCheckpointStore() rejects while an owner is recorded, including one left by a dead process, until recoverWorkflowCheckpoint() clears it. |

## Signature

```ts
export interface WorkflowCheckpointStore {
  acquire(runId: string): Promise<WorkflowCheckpointLease>;
}
```

## Related contracts

- [WorkflowCheckpointLease](../workflowcheckpointlease/)
