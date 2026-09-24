---
title: "WorkflowCheckpointStore"
description: "WorkflowCheckpointStore — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowCheckpointStore**. See the [workflow checkpoints guide](../../workflows/checkpoints/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowCheckpointStore } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowCheckpointStore {
  acquire(runId: string): Promise<WorkflowCheckpointLease>;
}
```

## Related contracts

- [WorkflowCheckpointLease](../workflowcheckpointlease/)
