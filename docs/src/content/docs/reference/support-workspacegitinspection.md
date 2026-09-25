---
title: "WorkspaceGitInspection"
description: "WorkspaceGitInspection — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name         | Type                           | Presence | Meaning                                                                                              |
| ------------ | ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `complete`   | `boolean`                      | Required | Whether all requested inspection work completed without hitting scan limits or inaccessible entries. |
| `workspaces` | `readonly WorkspaceGitEntry[]` | Required | Git state observations for the repository’s managed worktrees.                                       |
| `issues`     | `readonly StorageIssue[]`      | Required | Filesystem, Git or ownership problems that prevented complete inspection.                            |

## Signature

```ts
export interface WorkspaceGitInspection {
  readonly complete: boolean;
  readonly workspaces: readonly WorkspaceGitEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Related contracts

- [StorageIssue](../support-storageissue/)
- [WorkspaceGitEntry](../support-workspacegitentry/)
