---
title: "WorkspaceGitState"
description: "WorkspaceGitState — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name     | Type                                                           | Presence          | Meaning                                                                                                                                                             |
| -------- | -------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`  | `"registered" \| "unregistered" \| "unavailable" \| "skipped"` | Required          | registered: a Git worktree of this repository; unregistered: not listed by git worktree list; skipped: not a directory; unavailable: inspection failed, see reason. |
| `head`   | `string`                                                       | Variant-dependent | HEAD commit listed by git worktree list.                                                                                                                            |
| `branch` | `string \| null`                                               | Variant-dependent | Worktree branch name, or null when HEAD is detached.                                                                                                                |
| `dirty`  | `boolean`                                                      | Variant-dependent | true when git status reports tracked or untracked changes. Ignored files do not count.                                                                              |
| `locked` | `boolean`                                                      | Variant-dependent | Whether Git marks the worktree as locked.                                                                                                                           |
| `reason` | `string`                                                       | Variant-dependent | Why the state is skipped (NOT_DIRECTORY) or unavailable, such as WORKSPACE_CHANGED, REGISTRATION_MISMATCH or GIT_INSPECTION_FAILED.                                 |

## Signature

```ts
export type WorkspaceGitState =
  | {
      readonly state: "registered";
      readonly head: string;
      readonly branch: string | null;
      readonly dirty: boolean;
      readonly locked: boolean;
    }
  | {
      readonly state: "unregistered";
    }
  | {
      readonly state: "skipped" | "unavailable";
      readonly reason: string;
    };
```
