---
title: "RecipeFileWorkspaceReport"
description: "RecipeFileWorkspaceReport — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name            | Type                               | Presence | Meaning                                                                                                  |
| --------------- | ---------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `kind`          | `"files"`                          | Required | Identifies a named file workspace report.                                                                |
| `workspaceInfo` | `FileWorkspaceRecord \| undefined` | Optional | Versioned description of this workspace retaining ownership, settled generation and recovery references. |
| `fileOutputs`   | `readonly WorkspacePublication[]`  | Required | Verified publications of the outputs this workspace declares.                                            |

## Signature

```ts
export interface RecipeFileWorkspaceReport {
  readonly kind: "files";
  readonly workspaceInfo?: FileWorkspaceRecord;
  readonly fileOutputs: readonly WorkspacePublication[];
}
```
