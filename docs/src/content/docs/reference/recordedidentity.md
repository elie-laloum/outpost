---
title: "RecordedIdentity"
description: "RecordedIdentity — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecordedIdentity } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type     | Presence | Meaning                                               |
| ------- | -------- | -------- | ----------------------------------------------------- |
| `name`  | `string` | Required | Git identity name.                                    |
| `email` | `string` | Required | Git identity email.                                   |
| `date`  | `string` | Required | Git internal date: Unix seconds and time zone offset. |

## Signature

```ts
export interface RecordedIdentity {
  readonly name: string;
  readonly email: string;
  readonly date: string;
}
```
