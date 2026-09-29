---
title: "StageLimits"
description: "StageLimits — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StageLimits } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                                                                                                                                                |
| ----------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `copyMs`    | `number \| undefined` | Optional | Deadline for copying copies into the worktree, default 60000. When set on createSandbox() or dispatch(), it also bounds each sandbox upload and download, default 120000.              |
| `gitMs`     | `number \| undefined` | Optional | Deadline for each Git command that locates the repository, creates the worktree or refreshes a reused one, default 30000. Remote sandboxes also apply it to their Git synchronization. |
| `collectMs` | `number \| undefined` | Optional | Deadline for listing the commits a dispatch or attach produced, default 30000. Read from the sandbox options, so it has no effect on openWorkspace().                                  |
| `mergeMs`   | `number \| undefined` | Optional | Deadline for the git merge run by integrate(), default 30000. A timeout fails with code conflict, like any merge failure.                                                              |

## Signature

```ts
export interface StageLimits {
  readonly copyMs?: number;
  readonly gitMs?: number;
  readonly collectMs?: number;
  readonly mergeMs?: number;
}
```
