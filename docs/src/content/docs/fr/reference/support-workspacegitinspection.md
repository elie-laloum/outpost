---
title: "WorkspaceGitInspection"
description: "WorkspaceGitInspection — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom          | Type                           | Présence | Rôle                                                                                                                                          |
| ------------ | ------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `complete`   | `boolean`                      | Requis   | true lorsqu’aucun état de workspace n’est unavailable.                                                                                        |
| `workspaces` | `readonly WorkspaceGitEntry[]` | Requis   | État Git de chaque entrée de .outpost/workspaces.                                                                                             |
| `issues`     | `readonly StorageIssue[]`      | Requis   | Un problème par workspace unavailable, avec son motif comme code, ou un problème GIT_LIST_FAILED sur le dépôt quand git worktree list échoue. |

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
