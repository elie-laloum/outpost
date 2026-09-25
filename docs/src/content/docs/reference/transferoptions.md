---
title: "TransferOptions"
description: "TransferOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransferOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                       | Presence | Meaning                                                                                |
| ------------ | -------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `signal`     | `AbortSignal \| undefined` | Optional | Cooperative cancellation for this operation.                                           |
| `deadlineMs` | `number \| undefined`      | Optional | Maximum operation duration in milliseconds before terminating the command or transfer. |

## Signature

```ts
export interface TransferOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```
