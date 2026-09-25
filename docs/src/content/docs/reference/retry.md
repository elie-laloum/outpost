---
title: "Retry"
description: "Retry — Outpost API"
sidebar:
  order: 10
---

Public contract for **Retry**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { Retry } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name       | Type                                                          | Presence | Meaning                                                                 |
| ---------- | ------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `attempts` | `number`                                                      | Required | Attempt count or admission limit, according to the owning contract.     |
| `delayMs`  | `number \| undefined`                                         | Optional | See the linked contract and this family's rules for its interpretation. |
| `accepts`  | `((error: unknown, attempt: number) => boolean) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface Retry {
  readonly attempts: number;
  readonly delayMs?: number;
  readonly accepts?: (error: unknown, attempt: number) => boolean;
}
```
