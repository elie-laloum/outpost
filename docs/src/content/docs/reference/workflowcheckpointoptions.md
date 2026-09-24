---
title: "WorkflowCheckpointOptions"
description: "WorkflowCheckpointOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowCheckpointOptions**. See the [workflow checkpoints guide](../../workflows/checkpoints/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowCheckpointOptions } from "@elie-laloum/outpost";
```

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
