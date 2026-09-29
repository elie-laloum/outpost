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

| Name         | Type                       | Presence | Meaning                                                                                                                                                                   |
| ------------ | -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signal`     | `AbortSignal \| undefined` | Optional | Cooperative cancellation for this operation.                                                                                                                              |
| `deadlineMs` | `number \| undefined`      | Optional | Maximum duration in milliseconds; past it the transfer stops with code timeout. Outpost applies 120000 to sandbox file transfers unless limits.copyMs sets another value. |

## Signature

```ts
export interface TransferOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```
