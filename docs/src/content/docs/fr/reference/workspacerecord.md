---
title: "WorkspaceRecord"
description: "WorkspaceRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                | Présence | Rôle                                                                           |
| ---------------- | ------------------- | -------- | ------------------------------------------------------------------------------ |
| `repository`     | `string`            | Requis   | Checkout Git hôte ciblé.                                                       |
| `directory`      | `string`            | Requis   | Dossier hôte du workspace utilisé pour cette exécution.                        |
| `branch`         | `string`            | Requis   | Nom de la branche de travail utilisée ou observée pendant l’exécution.         |
| `baseBranch`     | `string`            | Requis   | Branche hôte choisie comme cible d’intégration à l’ouverture du workspace.     |
| `baseline`       | `string`            | Requis   | Commit Git utilisé comme état initial pour mesurer le nouveau travail.         |
| `gitDirectories` | `readonly string[]` | Requis   | Dossiers hôtes de métadonnées Git nécessaires à l’accès au dépôt du workspace. |
| `policy`         | `BranchPolicy`      | Requis   | Politique de branche choisie à l’ouverture du workspace.                       |

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
