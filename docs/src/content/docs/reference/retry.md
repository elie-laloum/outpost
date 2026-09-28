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

| Name         | Type                                                          | Presence | Meaning                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attempts`   | `number`                                                      | Required | Maximum total attempts, including the first execution.                                                                                                                                    |
| `delayMs`    | `number \| undefined`                                         | Optional | Base delay in milliseconds before a retry; defaults to zero. Exponential backoff doubles it after each failed attempt within this start() call.                                           |
| `backoff`    | `"fixed" \| "exponential" \| undefined`                       | Optional | Delay strategy: fixed by default, or exponential with a factor of two. Does not change attempt admission or the accepts predicate.                                                        |
| `maxDelayMs` | `number \| undefined`                                         | Optional | Nonnegative local delay cap, applied before jitter. Defaults to 30000 ms for exponential backoff; fixed delays have no additional cap. A valid server retryAfterMs minimum can exceed it. |
| `jitter`     | `"none" \| "full" \| undefined`                               | Optional | Randomization: none by default; full samples uniformly from zero to the capped local delay. The server retry minimum is applied afterwards and the result rounded up to milliseconds.     |
| `accepts`    | `((error: unknown, attempt: number) => boolean) \| undefined` | Optional | Predicate deciding whether a failure from the given attempt may be retried.                                                                                                               |

## Signature

```ts
export interface Retry {
  readonly attempts: number;
  readonly delayMs?: number;
  readonly backoff?: "fixed" | "exponential";
  readonly maxDelayMs?: number;
  readonly jitter?: "none" | "full";
  readonly accepts?: (error: unknown, attempt: number) => boolean;
}
```
