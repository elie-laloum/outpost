---
title: "ResourceInspection"
description: "ResourceInspection — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceInspection } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                 | Presence | Meaning                                                                                                                                                                                     |
| ---------- | ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scope`    | `"recorded-sandboxes"`               | Required | Always recorded-sandboxes: only records written by Outpost are listed, never the sandbox provider's account.                                                                                |
| `complete` | `boolean`                            | Required | False when a record was unreadable, an entry limit was reached or the records could not be listed. Recovery retention then keeps every workspace.                                           |
| `entries`  | `readonly ResourceInspectionEntry[]` | Required | One entry per record found, with its ownership verdict.                                                                                                                                     |
| `issues`   | `readonly StorageIssue[]`            | Required | Problems that made the inspection partial, such as RESOURCE_RECORD_UNREADABLE, RESOURCE_ENTRY_LIMIT or RESOURCE_DIRECTORY_UNAVAILABLE. In transport mode, the whole inventory's issue list. |

## Signature

```ts
export interface ResourceInspection {
  readonly scope: "recorded-sandboxes";
  readonly complete: boolean;
  readonly entries: readonly ResourceInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Related contracts

- [ResourceInspectionEntry](../resourceinspectionentry/)
- [StorageIssue](../support-storageissue/)
