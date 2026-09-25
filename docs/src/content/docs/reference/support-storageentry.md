---
title: "StorageEntry"
description: "StorageEntry — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                                              |
| ------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `revision`    | `string \| undefined` | Optional | Object revision for a transport inventory entry; absent for local filesystem inventory.              |
| `name`        | `string`              | Required | Filesystem basename of the inspected storage entry.                                                  |
| `path`        | `string`              | Required | Host path of the inspected storage entry.                                                            |
| `kind`        | `StorageEntryKind`    | Required | Filesystem entry type observed without following symbolic links.                                     |
| `modifiedAt`  | `string \| undefined` | Optional | ISO timestamp of the inspected entry’s last filesystem modification.                                 |
| `complete`    | `boolean`             | Required | Whether all requested inspection work completed without hitting scan limits or inaccessible entries. |
| `bytes`       | `number`              | Required | Observed byte size of this storage entry, including scanned children.                                |
| `files`       | `number`              | Required | Number of regular files counted in the scanned storage.                                              |
| `directories` | `number`              | Required | Number of directories counted in the scanned storage.                                                |
| `symlinks`    | `number`              | Required | Number of symbolic links counted without traversing their targets.                                   |
| `other`       | `number`              | Required | Number of filesystem entries that are neither regular files, directories nor symbolic links.         |

## Signature

```ts
export interface StorageEntry extends StorageUsage {
  readonly revision?: string;
  readonly name: string;
  readonly path: string;
  kind: StorageEntryKind;
  modifiedAt?: string;
  complete: boolean;
}
```

## Related contracts

- [StorageEntryKind](../support-storageentrykind/)
- [StorageUsage](../support-storageusage/)
