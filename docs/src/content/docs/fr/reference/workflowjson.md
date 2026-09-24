---
title: "WorkflowJson"
description: "WorkflowJson — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowJson**. Consultez le [guide checkpoints de workflow](../../workflows/checkpoints/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowJson } from "@elie-laloum/outpost";
```

## Signature

```ts
export type WorkflowJson =
  | null
  | boolean
  | number
  | string
  | readonly WorkflowJson[]
  | {
      readonly [key: string]: WorkflowJson;
    };
```
