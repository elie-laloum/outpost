---
title: "StorageUsage"
description: "StorageUsage — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name          | Type     | Presence | Meaning                                                                                      |
| ------------- | -------- | -------- | -------------------------------------------------------------------------------------------- |
| `bytes`       | `number` | Required | Total observed bytes across scanned storage entries.                                         |
| `files`       | `number` | Required | Number of regular files counted in the scanned storage.                                      |
| `directories` | `number` | Required | Number of directories counted in the scanned storage.                                        |
| `symlinks`    | `number` | Required | Number of symbolic links counted without traversing their targets.                           |
| `other`       | `number` | Required | Number of filesystem entries that are neither regular files, directories nor symbolic links. |

## Signature

```ts
export interface StorageUsage {
  bytes: number;
  files: number;
  directories: number;
  symlinks: number;
  other: number;
}
```
