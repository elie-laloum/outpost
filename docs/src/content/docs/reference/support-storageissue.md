---
title: "StorageIssue"
description: "StorageIssue — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name   | Type     | Presence | Meaning                                                                                                                                   |
| ------ | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `path` | `string` | Required | Path or object key that could not be fully inspected; empty for the ENTRY_LIMIT issue of a transport inventory.                           |
| `code` | `string` | Required | Reason code: a filesystem error code such as EACCES, or an Outpost code such as ENTRY_LIMIT, DEPTH_LIMIT, GIT_LIST_FAILED or INVALID_PID. |

## Signature

```ts
export interface StorageIssue {
  readonly path: string;
  readonly code: string;
}
```
