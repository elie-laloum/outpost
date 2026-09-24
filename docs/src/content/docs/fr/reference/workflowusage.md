---
title: "WorkflowUsage"
description: "WorkflowUsage — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowUsage**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowUsage } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowUsage {
  readonly attempts: number;
  readonly tokens: Usage;
}
```

## Contrats associés

- [Usage](../usage/)
