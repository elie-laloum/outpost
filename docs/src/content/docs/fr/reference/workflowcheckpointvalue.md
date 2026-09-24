---
title: "WorkflowCheckpointValue"
description: "WorkflowCheckpointValue — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowCheckpointValue**. Consultez le [guide checkpoints de workflow](../../workflows/checkpoints/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowCheckpointValue } from "@elie-laloum/outpost";
```

## Signature

```ts
export type WorkflowCheckpointValue =
  | {
      readonly kind: "undefined";
    }
  | {
      readonly kind: "json";
      readonly value: WorkflowJson;
    };
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
