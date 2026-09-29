---
title: "LockInspection"
description: "LockInspection — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name       | Type                             | Presence | Meaning                                                             |
| ---------- | -------------------------------- | -------- | ------------------------------------------------------------------- |
| `complete` | `boolean`                        | Required | true when no lock state is unknown.                                 |
| `scope`    | `"local-pid"`                    | Required | Always local-pid: ownership checks use local process identity.      |
| `entries`  | `readonly LockInspectionEntry[]` | Required | State of each entry in .outpost/locks.                              |
| `issues`   | `readonly StorageIssue[]`        | Required | One issue per lock whose state is unknown, with its reason as code. |

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
