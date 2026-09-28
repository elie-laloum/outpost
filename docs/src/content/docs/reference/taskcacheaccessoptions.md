---
title: "TaskCacheAccessOptions"
description: "TaskCacheAccessOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskCacheAccessOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                       | Presence | Meaning                                                            |
| -------- | -------------------------- | -------- | ------------------------------------------------------------------ |
| `signal` | `AbortSignal \| undefined` | Optional | Workflow cancellation signal forwarded to the store read or write. |

## Signature

```ts
export interface TaskCacheAccessOptions {
  readonly signal?: AbortSignal;
}
```
