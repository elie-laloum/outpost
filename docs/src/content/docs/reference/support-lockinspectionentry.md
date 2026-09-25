---
title: "LockInspectionEntry"
description: "LockInspectionEntry — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name        | Type                                              | Presence | Meaning                                                                 |
| ----------- | ------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `name`      | `string`                                          | Required | See the linked contract and this family's rules for its interpretation. |
| `path`      | `string`                                          | Required | See the linked contract and this family's rules for its interpretation. |
| `ownership` | `LockOwnership \| undefined`                      | Optional | See the linked contract and this family's rules for its interpretation. |
| `state`     | `"unknown" \| "skipped" \| "present" \| "absent"` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export type LockInspectionEntry = Pick<StorageEntry, "name" | "path"> &
  LockInspectionState;
```

## Related contracts

- [LockInspectionState](../support-lockinspectionstate/)
- [StorageEntry](../support-storageentry/)
