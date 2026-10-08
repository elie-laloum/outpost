---
title: "RecipeRunOptions"
description: "RecipeRunOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeRunOptions } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom      | Type                                                  | Présence  | Rôle                                                                                                                                                |
| -------- | ----------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inputs` | `Readonly<Record<string, WorkflowJson>> \| undefined` | Optionnel | Valeurs des paramètres déclarés ; le format 3 accepte aussi objets, tableaux et null JSON sans perte. Les paramètres sont validés avant les tâches. |
| `signal` | `AbortSignal \| undefined`                            | Optionnel | Annule cette invocation en attendant le nettoyage des ressources possédées.                                                                         |
| `report` | `"json" \| undefined`                                 | Optionnel | Remplace explicitement les rapports finaux configurés par un rapport JSON sur stdout ; n’active pas l’observation.                                  |

## Signature

```ts
export interface RecipeRunOptions {
  readonly inputs?: Readonly<Record<string, WorkflowJson>>;
  readonly signal?: AbortSignal;
  readonly report?: "json";
}
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
