---
title: "TransferOptions"
description: "TransferOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **TransferOptions**. See the [providers guide](../../providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { TransferOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface TransferOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```
