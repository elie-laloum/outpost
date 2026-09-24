---
title: "WorkflowCheckpointLease"
description: "WorkflowCheckpointLease — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowCheckpointLease**. See the [workflow checkpoints guide](../../workflows/checkpoints/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowCheckpointLease } from "@elie-laloum/outpost";
```

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
