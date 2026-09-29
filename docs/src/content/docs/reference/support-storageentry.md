---
title: "StorageEntry"
description: "StorageEntry — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                                                                                                                               |
| ------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `revision`    | `string \| undefined` | Optional | Object revision for a transport inventory entry; absent for local filesystem inventory.                                                                                               |
| `name`        | `string`              | Required | Basename of the entry, or the full object key for a transport inventory.                                                                                                              |
| `path`        | `string`              | Required | Host path of the entry, or the object key for a transport inventory.                                                                                                                  |
| `kind`        | `StorageEntryKind`    | Required | file, directory, symlink, other or unknown, read without following symbolic links. unknown means the entry could not be read or lay past the entry limit; transport objects are file. |
| `modifiedAt`  | `string \| undefined` | Optional | Latest modification time as an ISO timestamp, including the scanned children of a directory.                                                                                          |
| `complete`    | `boolean`             | Required | false when this entry or one of its children hit a scan limit or could not be read.                                                                                                   |
| `bytes`       | `number`              | Required | Sum of regular file sizes in this entry and its scanned children; symbolic links and directories count 0. The object size for a transport.                                            |
| `files`       | `number`              | Required | Number of regular files counted in the scanned storage.                                                                                                                               |
| `directories` | `number`              | Required | Number of directories counted in the scanned storage.                                                                                                                                 |
| `symlinks`    | `number`              | Required | Number of symbolic links counted without traversing their targets.                                                                                                                    |
| `other`       | `number`              | Required | Number of filesystem entries that are neither regular files, directories nor symbolic links.                                                                                          |

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
