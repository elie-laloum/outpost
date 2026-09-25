---
title: "WorkflowCheckpointValue"
description: "WorkflowCheckpointValue — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowCheckpointValue } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom     | Type                    | Présence          | Rôle                                                                                  |
| ------- | ----------------------- | ----------------- | ------------------------------------------------------------------------------------- |
| `kind`  | `"undefined" \| "json"` | Requis            | Distingue une sortie de tâche undefined d’une valeur JSON sans perte.                 |
| `value` | `WorkflowJson`          | Selon la variante | Représentation JSON sans perte d’une sortie de tâche terminée lorsque kind vaut json. |

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
