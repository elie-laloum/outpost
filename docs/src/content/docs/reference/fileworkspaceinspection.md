---
title: "FileWorkspaceInspection"
description: "FileWorkspaceInspection — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceInspection } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                                                                 |
| ----------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `record`    | `FileWorkspaceRecord` | Required | Versioned workspace description retaining ownership, settled generation and recovery references.        |
| `reference` | `TransportReference`  | Required | Transport key and revision identifying the conserved object; conditional revisions fence stale writers. |

## Signature

```ts
export interface FileWorkspaceInspection {
  readonly record: FileWorkspaceRecord;
  readonly reference: TransportReference;
}
```

## Related contracts

- [FileWorkspaceRecord](../fileworkspacerecord/)
- [TransportReference](../transportreference/)
