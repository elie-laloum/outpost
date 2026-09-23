---
title: "WorkflowOptions"
description: "WorkflowOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowOptions**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowOptions {
  readonly signal?: AbortSignal;
  readonly concurrency?: number;
  readonly stopOnError?: boolean;
  readonly observe?: (event: WorkflowEvent) => void;
}
```

## Contrats associés

- [WorkflowEvent](../workflowevent/)
