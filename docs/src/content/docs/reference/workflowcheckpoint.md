---
title: "WorkflowCheckpoint"
description: "WorkflowCheckpoint — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowCheckpoint**. See the [workflow checkpoints guide](../../workflows/checkpoints/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowCheckpoint } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowCheckpoint {
  readonly format: 1;
  readonly identity: string;
  readonly executionId: string;
  readonly records: readonly Readonly<TaskRecord>[];
  readonly values: Readonly<Record<string, WorkflowCheckpointValue>>;
  readonly usage: WorkflowUsage;
}
```

## Related contracts

- [TaskRecord](../taskrecord/)
- [WorkflowCheckpointValue](../workflowcheckpointvalue/)
- [WorkflowUsage](../workflowusage/)
