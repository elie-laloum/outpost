---
title: "WorkflowBudgetExceeded"
description: "WorkflowBudgetExceeded — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowBudgetExceeded**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { WorkflowBudgetExceeded } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare class WorkflowBudgetExceeded extends Error {
  readonly dimension: "attempts" | keyof Usage;
  readonly limit: number;
  readonly observed: number;
  constructor(
    dimension: "attempts" | keyof Usage,
    limit: number,
    observed: number,
  );
}
```

## Contrats associés

- [Usage](../usage/)
