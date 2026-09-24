---
title: "WorkflowBudget"
description: "WorkflowBudget — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowBudget**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowBudget } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowBudget {
  readonly attempts?: number;
  readonly usage?: Partial<Usage>;
}
```

## Contrats associés

- [Usage](../usage/)
