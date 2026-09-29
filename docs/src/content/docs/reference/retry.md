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
| `attempts`   | `number`                                                      | Required | Maximum attempts, the first included; a positive integer. The count restarts when the task runs again after a quota pause or a checkpoint resume.                                         |
| `delayMs`    | `number \| undefined`                                         | Optional | Wait in milliseconds before each retry, default 0.                                                                                                                                        |
| `backoff`    | `"fixed" \| "exponential" \| undefined`                       | Optional | Delay strategy: fixed (default) keeps delayMs; exponential doubles it after each failed attempt.                                                                                          |
| `maxDelayMs` | `number \| undefined`                                         | Optional | Nonnegative local delay cap, applied before jitter. Defaults to 30000 ms for exponential backoff; fixed delays have no additional cap. A valid server retryAfterMs minimum can exceed it. |
| `jitter`     | `"none" \| "full" \| undefined`                               | Optional | Randomization: none by default; full samples uniformly from zero to the capped local delay. The server retry minimum is applied afterwards and the result rounded up to milliseconds.     |
| `accepts`    | `((error: unknown, attempt: number) => boolean) \| undefined` | Optional | Receives the error and the attempt number; returning false fails the task without further retries.                                                                                        |

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
