---
title: "LockInspection"
description: "LockInspection — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name       | Type                             | Presence | Meaning                                                                 |
| ---------- | -------------------------------- | -------- | ----------------------------------------------------------------------- |
| `complete` | `boolean`                        | Required | See the linked contract and this family's rules for its interpretation. |
| `scope`    | `"local-pid"`                    | Required | See the linked contract and this family's rules for its interpretation. |
| `entries`  | `readonly LockInspectionEntry[]` | Required | See the linked contract and this family's rules for its interpretation. |
| `issues`   | `readonly StorageIssue[]`        | Required | See the linked contract and this family's rules for its interpretation. |

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
