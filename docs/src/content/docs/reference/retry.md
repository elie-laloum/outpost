---
title: "Retry"
description: "Retry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Retry } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                                          | Presence | Meaning                                                                     |
| ---------- | ------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| `attempts` | `number`                                                      | Required | Maximum total attempts, including the first execution.                      |
| `delayMs`  | `number \| undefined`                                         | Optional | Delay in milliseconds before a retry; defaults to zero.                     |
| `accepts`  | `((error: unknown, attempt: number) => boolean) \| undefined` | Optional | Predicate deciding whether a failure from the given attempt may be retried. |

## Signature

```ts
export interface Retry {
  readonly attempts: number;
  readonly delayMs?: number;
  readonly accepts?: (error: unknown, attempt: number) => boolean;
}
```
