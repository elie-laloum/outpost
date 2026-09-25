---
title: "WorkspaceGitEntry"
description: "WorkspaceGitEntry — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name     | Type                                                           | Presence          | Meaning                                                                            |
| -------- | -------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `name`   | `string`                                                       | Required          | Filesystem basename of the inspected storage entry.                                |
| `path`   | `string`                                                       | Required          | Host path of the inspected storage entry.                                          |
| `state`  | `"registered" \| "unregistered" \| "skipped" \| "unavailable"` | Required          | Classification of the worktree’s Git state used to decide whether cleanup is safe. |
| `head`   | `string`                                                       | Variant-dependent | Git HEAD commit recorded by the inspection or snapshot.                            |
| `branch` | `string \| null`                                               | Variant-dependent | Worktree branch name, or null when HEAD is detached.                               |
| `dirty`  | `boolean`                                                      | Variant-dependent | Whether tracked or untracked changes make the checkout dirty.                      |
| `locked` | `boolean`                                                      | Variant-dependent | Whether Git marks the worktree as locked.                                          |
| `reason` | `string`                                                       | Variant-dependent | Reason Git state could not be inspected or was deliberately skipped.               |

## Signature

```ts
export type WorkspaceGitEntry = Pick<StorageEntry, "name" | "path"> &
  WorkspaceGitState;
```

## Related contracts

- [StorageEntry](../support-storageentry/)
- [WorkspaceGitState](../support-workspacegitstate/)
