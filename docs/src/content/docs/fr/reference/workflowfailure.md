---
title: "WorkflowFailure"
description: "WorkflowFailure — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowFailure**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { WorkflowFailure } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare class WorkflowFailure extends Error {
  readonly result: WorkflowResult;
  constructor(result: WorkflowResult);
}
```

## Contrats associés

- [WorkflowResult](../workflowresult/)
