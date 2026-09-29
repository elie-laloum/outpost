---
title: "WorkflowBudget"
description: "WorkflowBudget — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowBudget } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                            | Présence  | Rôle                                                                                                                                                                     |
| ---------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `attempts` | `number \| undefined`                           | Optionnel | Nombre maximal de tentatives admises sur l’exécution et ses reprises de checkpoint. L’atteindre annule les tâches non démarrées.                                         |
| `usage`    | `Partial<Omit<Usage, "complete">> \| undefined` | Optionnel | Limites de tokens par compteur (input, cached, cacheCreated, output). En atteindre une annule aussi les tâches en cours ; un usage signalé tardivement peut la dépasser. |

## Signature

```ts
export interface WorkflowBudget {
  readonly attempts?: number;
  readonly usage?: Partial<Omit<Usage, "complete">>;
}
```

## Contrats associés

- [Usage](../usage/)
