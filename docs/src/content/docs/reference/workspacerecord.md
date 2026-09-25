---
title: "WorkspaceRecord"
description: "WorkspaceRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                | Presence | Meaning                                                                    |
| ---------------- | ------------------- | -------- | -------------------------------------------------------------------------- |
| `repository`     | `string`            | Required | Target host Git checkout.                                                  |
| `directory`      | `string`            | Required | Host workspace directory used for this execution.                          |
| `branch`         | `string`            | Required | Name of the work branch used or observed during execution.                 |
| `baseBranch`     | `string`            | Required | Host branch selected as the integration target when the workspace opened.  |
| `baseline`       | `string`            | Required | Git commit used as the initial snapshot for measuring new work.            |
| `gitDirectories` | `readonly string[]` | Required | Host Git metadata directories required to access the workspace repository. |
| `policy`         | `BranchPolicy`      | Required | Branch policy chosen when the workspace was opened.                        |

## Signature

```ts
export interface WorkspaceRecord {
  readonly repository: string;
  readonly directory: string;
  readonly branch: string;
  readonly baseBranch: string;
  readonly baseline: string;
  readonly gitDirectories: readonly string[];
  readonly policy: BranchPolicy;
}
```

## Related contracts

- [BranchPolicy](../branchpolicy/)
