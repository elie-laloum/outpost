---
title: "WorkspaceGitInspection"
description: "WorkspaceGitInspection — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom          | Type                           | Présence | Rôle                                                                                                  |
| ------------ | ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------- |
| `complete`   | `boolean`                      | Requis   | Indique si toute l’inspection demandée s’est terminée sans limite de parcours ni entrée inaccessible. |
| `workspaces` | `readonly WorkspaceGitEntry[]` | Requis   | Observations d’état Git des worktrees gérés du dépôt.                                                 |
| `issues`     | `readonly StorageIssue[]`      | Requis   | Problèmes de fichiers, Git ou possession ayant empêché une inspection complète.                       |

## Signature

```ts
export interface WorkspaceGitInspection {
  readonly complete: boolean;
  readonly workspaces: readonly WorkspaceGitEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Contrats associés

- [StorageIssue](../support-storageissue/)
- [WorkspaceGitEntry](../support-workspacegitentry/)
