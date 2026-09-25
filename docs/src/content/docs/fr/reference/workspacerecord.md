---
title: "WorkspaceRecord"
description: "WorkspaceRecord — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkspaceRecord**. Consultez le [guide workspaces](../../guide/environment/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkspaceRecord } from "@elie-laloum/outpost";
```

## Rôle et comportement

Posséder un checkout, une branche et un verrou indépendamment de la durée de vie de la sandbox.

Le dépôt vaut par défaut le dossier courant. Les branches nommées conservent les commits ; les worktrees sales ou détachés restent récupérables. Fermez la sandbox avant le workspace appartenant à l’appelant.

[Exemple complet et règles détaillées](../../guide/environment/workspaces/).

## Paramètres et propriétés

| Nom              | Type                | Présence | Rôle                                                                             |
| ---------------- | ------------------- | -------- | -------------------------------------------------------------------------------- |
| `repository`     | `string`            | Requis   | Checkout Git hôte ciblé.                                                         |
| `directory`      | `string`            | Requis   | Dossier utilisé par l’opération ; voir les règles de résolution.                 |
| `branch`         | `string`            | Requis   | Politique de workspace Git ou identité de branche résultante selon ce contrat.   |
| `baseBranch`     | `string`            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `baseline`       | `string`            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `gitDirectories` | `readonly string[]` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `policy`         | `BranchPolicy`      | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface WorkspaceRecord {
  readonly repository: string;
  readonly directory: string;
  readonly branch: string;
  readonly baseBranch: string;
  readonly baseline: string;
  readonly gitDirectories: readonly string[];
  readonly policy: BranchPolicy;
}
```

## Contrats associés

- [BranchPolicy](../branchpolicy/)
