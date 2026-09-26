---
title: "GeneratedCredential"
description: "GeneratedCredential — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name      | Type     | Presence | Meaning                                         |
| --------- | -------- | -------- | ----------------------------------------------- |
| `path`    | `string` | Required | File path relative to the private sandbox home. |
| `content` | `string` | Required | Fixed file content written with mode 0600.      |

## Signature

```ts
export interface GeneratedCredential {
  readonly path: string;
  readonly content: string;
}
```
