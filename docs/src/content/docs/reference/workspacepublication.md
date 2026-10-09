---
title: "WorkspacePublication"
description: "WorkspacePublication — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspacePublication } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                 | Presence | Meaning                                                                                                 |
| ------------- | ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `id`          | `string`                                             | Required | Stable identifier of this resource, independent of its materialization path.                            |
| `destination` | `string`                                             | Required | Host destination preserving selected relative paths; overlap with an active writable source is refused. |
| `state`       | `"complete" \| "rolled-back" \| "recovery-required"` | Required | Persisted lifecycle state; uncertain or recovery-required resources are never silently reconstructed.   |
| `created`     | `readonly string[]`                                  | Required | Relative paths of the corresponding verified publication operations.                                    |
| `replaced`    | `readonly string[]`                                  | Required | Relative paths of the corresponding verified publication operations.                                    |
| `deleted`     | `readonly string[]`                                  | Required | Relative paths of the corresponding verified publication operations.                                    |
| `reference`   | `TransportReference`                                 | Required | Transport key and revision identifying the conserved object; conditional revisions fence stale writers. |

## Signature

```ts
export interface WorkspacePublication {
  readonly id: string;
  readonly destination: string;
  readonly state: "complete" | "rolled-back" | "recovery-required";
  readonly created: readonly string[];
  readonly replaced: readonly string[];
  readonly deleted: readonly string[];
  readonly reference: TransportReference;
}
```

## Related contracts

- [TransportReference](../transportreference/)
