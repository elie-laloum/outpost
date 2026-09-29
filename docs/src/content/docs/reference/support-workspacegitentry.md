---
title: "WorkspaceGitEntry"
description: "WorkspaceGitEntry — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name     | Type                                                           | Presence          | Meaning                                                                                                                                                             |
| -------- | -------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | `string`                                                       | Required          | Basename of the entry, or the full object key for a transport inventory.                                                                                            |
| `path`   | `string`                                                       | Required          | Host path of the entry, or the object key for a transport inventory.                                                                                                |
| `state`  | `"registered" \| "unregistered" \| "unavailable" \| "skipped"` | Required          | registered: a Git worktree of this repository; unregistered: not listed by git worktree list; skipped: not a directory; unavailable: inspection failed, see reason. |
| `head`   | `string`                                                       | Variant-dependent | HEAD commit listed by git worktree list.                                                                                                                            |
| `branch` | `string \| null`                                               | Variant-dependent | Worktree branch name, or null when HEAD is detached.                                                                                                                |
| `dirty`  | `boolean`                                                      | Variant-dependent | true when git status reports tracked or untracked changes. Ignored files do not count.                                                                              |
| `locked` | `boolean`                                                      | Variant-dependent | Whether Git marks the worktree as locked.                                                                                                                           |
| `reason` | `string`                                                       | Variant-dependent | Why the state is skipped (NOT_DIRECTORY) or unavailable, such as WORKSPACE_CHANGED, REGISTRATION_MISMATCH or GIT_INSPECTION_FAILED.                                 |

## Signature

```ts
export type WorkspaceGitEntry = Pick<StorageEntry, "name" | "path"> &
  WorkspaceGitState;
```

## Related contracts

- [StorageEntry](../support-storageentry/)
- [WorkspaceGitState](../support-workspacegitstate/)
