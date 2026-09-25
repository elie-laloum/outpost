---
title: "Disposal"
description: "Disposal — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Disposal**. Consultez le [guide workspaces](../../guide/environment/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Disposal } from "@elie-laloum/outpost";
```

## Rôle et comportement

Posséder un checkout, une branche et un verrou indépendamment de la durée de vie de la sandbox.

Le dépôt vaut par défaut le dossier courant. Les branches nommées conservent les commits ; les worktrees sales ou détachés restent récupérables. Fermez la sandbox avant le workspace appartenant à l’appelant.

[Exemple complet et règles détaillées](../../guide/environment/workspaces/).

## Paramètres et propriétés

| Nom                 | Type                  | Présence  | Rôle                                                |
| ------------------- | --------------------- | --------- | --------------------------------------------------- |
| `retainedDirectory` | `string \| undefined` | Optionnel | Workspace conservé pour inspection ou récupération. |

## Signature

```ts
export interface Disposal {
  readonly retainedDirectory?: string;
}
```
