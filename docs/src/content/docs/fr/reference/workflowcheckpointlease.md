---
title: "WorkflowCheckpointLease"
description: "WorkflowCheckpointLease — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowCheckpointLease**. Consultez le [guide checkpoints de workflow](../../workflows/checkpoints/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [WorkflowCheckpoint](../workflowcheckpoint/)
