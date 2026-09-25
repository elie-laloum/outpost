---
title: "Commit"
description: "Commit — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Commit } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type     | Presence | Meaning                               |
| --------- | -------- | -------- | ------------------------------------- |
| `oid`     | `string` | Required | Git commit object ID.                 |
| `subject` | `string` | Required | First line of the Git commit message. |

## Signature

```ts
export interface Commit {
  readonly oid: string;
  readonly subject: string;
}
```
