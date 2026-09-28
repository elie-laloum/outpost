---
title: "WorkflowGateOptions"
description: "WorkflowGateOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowGateOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                    | Présence  | Rôle                                                                                                                                         |
| ---------------- | --------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication` | `"signed" \| undefined`                 | Optionnel | Exige une preuve vérifiée pour ce gate d’approbation ou de pause et inscrit cette exigence dans l’identité du graphe.                        |
| `key`            | `string`                                | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                                         |
| `after`          | `readonly Task<unknown>[] \| undefined` | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                                    |
| `prompt`         | `string`                                | Requis    | Instruction expliquant la décision d’approbation ou de reprise demandée à l’acteur de confiance.                                             |
| `actors`         | `readonly string[]`                     | Requis    | Noms d’acteurs non vides et uniques autorisés à décider le gate créé ; l’authentification signée lie l’acteur choisi à une clé de confiance. |

## Signature

```ts
export interface WorkflowGateOptions {
  readonly authentication?: "signed";
  readonly key: string;
  readonly after?: readonly Task[];
  readonly prompt: string;
  readonly actors: readonly string[];
}
```

## Contrats associés

- [Task](../type-task/)
