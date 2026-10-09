---
title: "WorkspaceConversationArchive"
description: "WorkspaceConversationArchive — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceConversationArchive } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                 | Presence | Meaning                                                                                                 |
| --------- | -------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `id`      | `string`             | Required | Stable identifier of this resource, independent of its materialization path.                            |
| `format`  | `string`             | Required | Version of the persisted envelope; unsupported versions are refused.                                    |
| `path`    | `string`             | Required | Validated relative path preserving its prefix; traversal and control paths are refused.                 |
| `archive` | `TransportReference` | Required | Transport key and revision identifying the conserved object; conditional revisions fence stale writers. |

## Signature

```ts
export interface WorkspaceConversationArchive {
  readonly id: string;
  readonly format: string;
  readonly path: string;
  readonly archive: TransportReference;
}
```

## Related contracts

- [TransportReference](../transportreference/)
