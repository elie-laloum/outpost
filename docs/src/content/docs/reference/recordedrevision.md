---
title: "RecordedRevision"
description: "RecordedRevision — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecordedRevision } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type     | Presence | Meaning                                                             |
| -------- | -------- | -------- | ------------------------------------------------------------------- |
| `commit` | `string` | Required | Commit the dispatch started from.                                   |
| `tree`   | `string` | Required | Tree of that commit; replay compares it with the sandbox HEAD tree. |

## Signature

```ts
export interface RecordedRevision {
  readonly commit: string;
  readonly tree: string;
}
```
