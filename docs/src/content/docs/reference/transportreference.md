---
title: "TransportReference"
description: "TransportReference — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportReference } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type     | Presence | Meaning                                                                                                               |
| ---------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `key`      | `string` | Required | Logical key in the configured transport; the reference contains no credentials or backend client.                     |
| `revision` | `string` | Required | Exact revision to read; a replaced or deleted object rejects with TransportConflict instead of returning other bytes. |

## Signature

```ts
export interface TransportReference {
  readonly key: string;
  readonly revision: string;
}
```
