---
title: "TaskInteraction"
description: "TaskInteraction — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskInteraction } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                | Presence | Meaning                                                                                   |
| ---------- | ------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `actors`   | `readonly string[]` | Required | Unique application-trusted actor identifiers authorized to answer this task.              |
| `identity` | `string`            | Required | Stable interaction configuration fingerprint included in checkpoint compatibility checks. |

## Signature

```ts
export interface TaskInteraction {
  readonly actors: readonly string[];
  readonly identity: string;
}
```
