---
title: "RecipeWorkspaceCheckpoint"
description: "RecipeWorkspaceCheckpoint — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name          | Type                                                  | Presence | Meaning                                                                                                                          |
| ------------- | ----------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `fileRecord`  | `FileWorkspaceRecord \| undefined`                    | Optional | Versioned workspace description retaining ownership, settled generation and recovery references.                                 |
| `integration` | `ConflictResolution \| undefined`                     | Optional | Persisted conflict resolution result, including separate resolver usage, retained with the original workspace after integration. |
| `state`       | `"ready" \| "allocating" \| "closed" \| "integrated"` | Required | Allocation and cleanup state; allocating requires explicit recovery and closed resources are never replaced during resume.       |
| `record`      | `WorkspaceRecord \| undefined`                        | Optional | Original repository, branch, directory, Git metadata and diff baseline retained for exact workspace restoration.                 |

## Signature

```ts
export interface RecipeWorkspaceCheckpoint {
  readonly fileRecord?: FileWorkspaceRecord;
  readonly integration?: RecipeReport["integration"];
  readonly state: "allocating" | "ready" | "integrated" | "closed";
  readonly record?: WorkspaceRecord;
}
```

## Related contracts

- [RecipeReport](../support-recipereport/)
- [WorkspaceRecord](../workspacerecord/)
