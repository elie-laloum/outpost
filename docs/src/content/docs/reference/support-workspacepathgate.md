---
title: "WorkspacePathGate"
description: "WorkspacePathGate — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name     | Type     | Presence | Meaning                                                                                  |
| -------- | -------- | -------- | ---------------------------------------------------------------------------------------- |
| `device` | `number` | Required | Filesystem identity component captured with lstat, without following the selected entry. |
| `inode`  | `number` | Required | Filesystem identity component captured with lstat, without following the selected entry. |

## Signature

```ts
export interface WorkspacePathGate {
  readonly device: number;
  readonly inode: number;
}
```
