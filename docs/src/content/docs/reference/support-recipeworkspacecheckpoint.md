---
title: "RecipeWorkspaceCheckpoint"
description: "RecipeWorkspaceCheckpoint — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name     | Type                                                  | Presence | Meaning                                                                                                                    |
| -------- | ----------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `state`  | `"closed" \| "allocating" \| "ready" \| "integrated"` | Required | Allocation and cleanup state; allocating requires explicit recovery and closed resources are never replaced during resume. |
| `record` | `WorkspaceRecord \| undefined`                        | Optional | Original repository, branch, directory, Git metadata and diff baseline retained for exact workspace restoration.           |

## Signature

```ts
export interface RecipeWorkspaceCheckpoint {
  readonly state: "allocating" | "ready" | "integrated" | "closed";
  readonly record?: WorkspaceRecord;
}
```

## Related contracts

- [WorkspaceRecord](../workspacerecord/)
