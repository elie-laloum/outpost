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

| Nom              | Type                | Présence | Rôle                                                                                                                                                       |
| ---------------- | ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`     | `string`            | Requis   | Chemin réel du répertoire racine du checkout hôte.                                                                                                         |
| `directory`      | `string`            | Requis   | Dossier hôte dans lequel l’agent travaille : le worktree sous .outpost/workspaces, ou le checkout lui-même en mode current.                                |
| `branch`         | `string`            | Requis   | Nom de la branche de travail. En mode current, la branche extraite, ou HEAD si elle est détachée.                                                          |
| `baseBranch`     | `string`            | Requis   | Branche extraite dans le checkout hôte à l’ouverture du workspace, et cible de integrate(). Vide si HEAD était détaché.                                    |
| `baseline`       | `string`            | Requis   | Commit extrait dans le workspace à son ouverture. Chaque dispatch liste les commits depuis son propre commit de départ, pas depuis celui-ci.               |
| `gitDirectories` | `readonly string[]` | Requis   | Chemins hôtes du dossier Git du worktree et du dossier Git commun du dépôt. Les providers de conteneurs les montent, sauf si repositoryMode vaut isolated. |
| `policy`         | `BranchPolicy`      | Requis   | Politique de branche appliquée, { mode: "current" } si aucune n’a été fournie.                                                                             |

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
