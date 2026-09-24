---
title: "WorkflowCheckpointOptions"
description: "WorkflowCheckpointOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowCheckpointOptions**. Consultez le [guide checkpoints de workflow](../../workflows/checkpoints/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [WorkflowCheckpointStore](../workflowcheckpointstore/)
