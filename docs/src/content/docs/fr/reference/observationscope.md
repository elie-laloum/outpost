---
title: "ObservationScope"
description: "ObservationScope — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationScope } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                                                                                    |
| ------------- | --------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `executionId` | `string \| undefined` | Optionnel | Identifiant d’exécution du workflow, conservé lors de la reprise de son checkpoint.                                                     |
| `taskKey`     | `string \| undefined` | Optionnel | Clé déclarée de la tâche de workflow qui produit cet événement.                                                                         |
| `attempt`     | `number \| undefined` | Optionnel | Numéro de tentative de la tâche ; l’évaluation d’une condition peut utiliser zéro.                                                      |
| `dispatchId`  | `string \| undefined` | Optionnel | Identifiant unique d’un dispatch froid ou chaud, partagé entre ses passes.                                                              |
| `pass`        | `number \| undefined` | Optionnel | Numéro de passe de l’agent dans le dispatch.                                                                                            |
| `subagentId`  | `string \| undefined` | Optionnel | Identifiant de l’enfant intégré dans le dispatch, propagé depuis ses événements sans remplacer le contexte de workflow, tâche ou passe. |
| `candidate`   | `string \| undefined` | Optionnel | Clé déclarée du candidat spéculatif.                                                                                                    |

## Signature

```ts
export interface ObservationScope {
  readonly executionId?: string;
  readonly taskKey?: string;
  readonly attempt?: number;
  readonly dispatchId?: string;
  readonly pass?: number;
  readonly subagentId?: string;
  readonly candidate?: string;
}
```
