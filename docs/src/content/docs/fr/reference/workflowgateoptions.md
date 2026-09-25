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

| Nom      | Type                                    | Présence  | Rôle                                                                                                                        |
| -------- | --------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `key`    | `string`                                | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                        |
| `after`  | `readonly Task<unknown>[] \| undefined` | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                   |
| `prompt` | `string`                                | Requis    | Instruction expliquant la décision d’approbation ou de reprise demandée à l’acteur de confiance.                            |
| `actors` | `readonly string[]`                     | Requis    | Liste non vide des noms d’acteurs de confiance autorisés à décider cette gate ; leur authentification relève de l’appelant. |

## Signature

```ts
export interface WorkflowGateOptions {
  readonly key: string;
  readonly after?: readonly Task[];
  readonly prompt: string;
  readonly actors: readonly string[];
}
```

## Contrats associés

- [Task](../type-task/)
