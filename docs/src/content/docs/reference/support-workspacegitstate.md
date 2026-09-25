---
title: "WorkspaceGitState"
description: "WorkspaceGitState — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name     | Type                                                           | Presence          | Meaning                                                                            |
| -------- | -------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `state`  | `"registered" \| "unregistered" \| "skipped" \| "unavailable"` | Required          | Classification of the worktree’s Git state used to decide whether cleanup is safe. |
| `head`   | `string`                                                       | Variant-dependent | Git HEAD commit recorded by the inspection or snapshot.                            |
| `branch` | `string \| null`                                               | Variant-dependent | Worktree branch name, or null when HEAD is detached.                               |
| `dirty`  | `boolean`                                                      | Variant-dependent | Whether tracked or untracked changes make the checkout dirty.                      |
| `locked` | `boolean`                                                      | Variant-dependent | Whether Git marks the worktree as locked.                                          |
| `reason` | `string`                                                       | Variant-dependent | Reason Git state could not be inspected or was deliberately skipped.               |

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
