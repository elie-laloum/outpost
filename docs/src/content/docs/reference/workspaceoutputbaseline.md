---
title: "WorkspaceOutputBaseline"
description: "WorkspaceOutputBaseline — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceOutputBaseline } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                            | Presence | Meaning                                                                                                  |
| ---------- | ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `options`  | `WorkspaceOutputOptions`        | Required | Options selecting source, execution capabilities or inspected recovery preconditions for this operation. |
| `expected` | `readonly WorkspaceFileEntry[]` | Required | Destination manifest captured before execution and used to detect concurrent edits.                      |

## Signature

```ts
export interface WorkspaceOutputBaseline {
  readonly options: WorkspaceOutputOptions;
  readonly expected: readonly WorkspaceFileEntry[];
}
```

## Related contracts

- [WorkspaceFileEntry](../workspacefileentry/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
