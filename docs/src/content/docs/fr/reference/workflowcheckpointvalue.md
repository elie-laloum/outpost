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

| Nom     | Type                    | Présence          | Rôle                                                                                                                                         |
| ------- | ----------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`  | `"undefined" \| "json"` | Requis            | undefined lorsque la tâche a renvoyé undefined, json sinon.                                                                                  |
| `value` | `WorkflowJson`          | Selon la variante | Sortie de la tâche en JSON sans perte : objets simples, tableaux denses, chaînes, booléens, null et nombres finis autres que -0, sans cycle. |

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
