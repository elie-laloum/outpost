---
title: "LockInspectionEntry"
description: "LockInspectionEntry — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name        | Type                                              | Presence          | Meaning                                                                    |
| ----------- | ------------------------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| `name`      | `string`                                          | Required          | Filesystem basename of the inspected storage entry.                        |
| `path`      | `string`                                          | Required          | Host path of the inspected storage entry.                                  |
| `ownership` | `LockOwnership \| undefined`                      | Optional          | Assessment of whether the recorded local process still owns the resource.  |
| `state`     | `"present" \| "absent" \| "unknown" \| "skipped"` | Required          | Whether the lock file is present, absent, unknown or deliberately skipped. |
| `pid`       | `number \| number \| undefined`                   | Variant-dependent | Process ID parsed from the local lock file when available.                 |
| `reason`    | `string \| "NOT_FILE"`                            | Variant-dependent | Reason the local lock was classified with this ownership state.            |

## Signature

```ts
export type LockInspectionEntry = Pick<StorageEntry, "name" | "path"> &
  LockInspectionState;
```

## Related contracts

- [LockInspectionState](../support-lockinspectionstate/)
- [StorageEntry](../support-storageentry/)
