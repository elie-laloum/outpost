---
title: "StageLimits"
description: "StageLimits — Outpost API"
sidebar:
  order: 10
---

Contrat public de **StageLimits**. Consultez le [guide workspaces](../../guide/environment/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { StageLimits } from "@elie-laloum/outpost";
```

## Rôle et comportement

Posséder un checkout, une branche et un verrou indépendamment de la durée de vie de la sandbox.

Le dépôt vaut par défaut le dossier courant. Les branches nommées conservent les commits ; les worktrees sales ou détachés restent récupérables. Fermez la sandbox avant le workspace appartenant à l’appelant.

[Exemple complet et règles détaillées](../../guide/environment/workspaces/).

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                             |
| ----------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `copyMs`    | `number \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `gitMs`     | `number \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `collectMs` | `number \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `mergeMs`   | `number \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface StageLimits {
  readonly copyMs?: number;
  readonly gitMs?: number;
  readonly collectMs?: number;
  readonly mergeMs?: number;
}
```
