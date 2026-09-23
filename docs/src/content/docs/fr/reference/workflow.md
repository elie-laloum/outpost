---
title: "Workflow"
description: "Workflow — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Workflow**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Workflow } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Workflow {
  readonly name: string;
  readonly tasks: readonly Task[];
  start(options?: WorkflowOptions): Promise<WorkflowResult>;
  diagram(): string;
}
```

## Contrats associés

- [Task](../task/)
- [WorkflowOptions](../workflowoptions/)
- [WorkflowResult](../workflowresult/)
