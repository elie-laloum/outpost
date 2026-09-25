---
title: "WorkspaceOptions"
description: "WorkspaceOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkspaceOptions**. Consultez le [guide workspaces](../../guide/environment/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkspaceOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Posséder un checkout, une branche et un verrou indépendamment de la durée de vie de la sandbox.

Le dépôt vaut par défaut le dossier courant. Les branches nommées conservent les commits ; les worktrees sales ou détachés restent récupérables. Fermez la sandbox avant le workspace appartenant à l’appelant.

[Exemple complet et règles détaillées](../../guide/environment/workspaces/).

## Paramètres et propriétés

| Nom            | Type                                                     | Présence  | Rôle                                                                             |
| -------------- | -------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `signal`       | `AbortSignal \| undefined`                               | Optionnel | Annulation coopérative de cette opération.                                       |
| `repository`   | `string \| undefined`                                    | Optionnel | Checkout Git hôte ciblé.                                                         |
| `branch`       | `BranchPolicy \| undefined`                              | Optionnel | Politique de workspace Git ou identité de branche résultante selon ce contrat.   |
| `copies`       | `readonly string[] \| undefined`                         | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                            |
| `limits`       | `StageLimits \| undefined`                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `label`        | `string \| undefined`                                    | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `hooks`        | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                  |

## Signature

```ts
export interface WorkspaceOptions {
  readonly storageQuota?: Omit<StorageReservationOptions, "signal">;
  readonly signal?: AbortSignal;
  readonly repository?: string;
  readonly branch?: BranchPolicy;
  readonly copies?: readonly string[];
  readonly limits?: StageLimits;
  readonly label?: string;
  readonly hooks?: LifecycleHooks;
}
```

## Contrats associés

- [BranchPolicy](../branchpolicy/)
- [LifecycleHooks](../lifecyclehooks/)
- [StageLimits](../stagelimits/)
- [StorageReservationOptions](../storagereservationoptions/)
