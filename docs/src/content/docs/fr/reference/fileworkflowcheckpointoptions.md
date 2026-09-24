---
title: "FileWorkflowCheckpointOptions"
description: "FileWorkflowCheckpointOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **FileWorkflowCheckpointOptions**. Consultez le [guide checkpoints de workflow](../../workflows/checkpoints/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { FileWorkflowCheckpointOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface FileWorkflowCheckpointOptions {
  /** Private directory for checkpoint data and local process ownership locks. */
  readonly directory: string;
}
```
