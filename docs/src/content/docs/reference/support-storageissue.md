---
title: "StorageIssue"
description: "StorageIssue — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name   | Type     | Presence | Meaning                                                         |
| ------ | -------- | -------- | --------------------------------------------------------------- |
| `path` | `string` | Required | Filesystem path at which inspection encountered a problem.      |
| `code` | `string` | Required | Filesystem or inspection error code for the inaccessible entry. |

## Signature

```ts
export interface StorageIssue {
  readonly path: string;
  readonly code: string;
}
```
