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

| Name       | Type                                 | Presence | Meaning                                                                                              |
| ---------- | ------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `scope`    | `"recorded-sandboxes"`               | Required | Always recorded-sandboxes: inventory covers local activity records, not remote accounts.             |
| `complete` | `boolean`                            | Required | Whether all requested inspection work completed without hitting scan limits or inaccessible entries. |
| `entries`  | `readonly ResourceInspectionEntry[]` | Required | Local sandbox activity files and their ownership assessments.                                        |
| `issues`   | `readonly StorageIssue[]`            | Required | Filesystem, Git or ownership problems that prevented complete inspection.                            |

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
