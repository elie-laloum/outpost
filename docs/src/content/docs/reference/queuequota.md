---
title: "QueueQuota"
description: "QueueQuota — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueQuota } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                                                                                        |
| -------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `resetAt`      | `string \| undefined` | Optional | ISO time at which the limit resets, when the handler’s error reported it.                                                                      |
| `conversation` | `string \| undefined` | Optional | Captured conversation of the interrupted handler run; the workflow passes it back through TaskContext.quota so the next input can continue it. |

## Signature

```ts
export interface QueueQuota {
  readonly resetAt?: string;
  /** Captured conversation the handler can continue after the pause. */
  readonly conversation?: string;
}
```
