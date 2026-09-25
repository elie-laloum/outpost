---
title: "LockInspection"
description: "LockInspection — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name       | Type                             | Presence | Meaning                                                                                              |
| ---------- | -------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `complete` | `boolean`                        | Required | Whether all requested inspection work completed without hitting scan limits or inaccessible entries. |
| `scope`    | `"local-pid"`                    | Required | Always local-pid: ownership checks use local process identity.                                       |
| `entries`  | `readonly LockInspectionEntry[]` | Required | Inspected lock files and their local ownership assessments.                                          |
| `issues`   | `readonly StorageIssue[]`        | Required | Filesystem, Git or ownership problems that prevented complete inspection.                            |

## Signature

```ts
export interface LockInspection {
  readonly complete: boolean;
  readonly scope: "local-pid";
  readonly entries: readonly LockInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Related contracts

- [LockInspectionEntry](../support-lockinspectionentry/)
- [StorageIssue](../support-storageissue/)
