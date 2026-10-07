---
title: "ConflictResolution"
description: "ConflictResolution — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConflictResolution } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                                                                                                                           |
| -------------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commit`       | `string`              | Required | Exact verified resolution commit, checked against the resolution workspace HEAD and required to contain both frozen input commits before fast-forward integration.                |
| `branch`       | `string`              | Required | Name of the dedicated resolution branch. Must match the supplied workspace; remains available for review after success or failure.                                                |
| `directory`    | `string`              | Required | Host directory of the dedicated resolution worktree. Must match the supplied workspace; clean successful worktrees may be removed, while failed resolutions are retained.         |
| `usage`        | `Usage`               | Required | Token usage of the resolution dispatch, including explicit fallback attempts. Returned separately from the original task usage; callers must add it to their workflow accounting. |
| `verification` | `CommandResult`       | Required | Actual verification command result. Nonzero status refuses integration; the built-in strategy also requires the verified commit and nonignored files to remain unchanged.         |
| `transcript`   | `string \| undefined` | Optional | Captured transcript path from the resolution dispatch when its agent supports and enables conversation capture.                                                                   |

## Signature

```ts
export interface ConflictResolution {
  readonly commit: string;
  readonly branch: string;
  readonly directory: string;
  readonly usage: Usage;
  readonly verification: CommandResult;
  readonly transcript?: string;
}
```

## Related contracts

- [CommandResult](../commandresult/)
- [Usage](../usage/)
