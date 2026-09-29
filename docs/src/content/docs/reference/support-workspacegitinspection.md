---
title: "WorkspaceGitInspection"
description: "WorkspaceGitInspection — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name         | Type                           | Presence | Meaning                                                                                                                                    |
| ------------ | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `complete`   | `boolean`                      | Required | true when no workspace state is unavailable.                                                                                               |
| `workspaces` | `readonly WorkspaceGitEntry[]` | Required | Git state of each entry in .outpost/workspaces.                                                                                            |
| `issues`     | `readonly StorageIssue[]`      | Required | One issue per unavailable workspace, with its reason as code, or one GIT_LIST_FAILED issue on the repository when git worktree list fails. |

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
