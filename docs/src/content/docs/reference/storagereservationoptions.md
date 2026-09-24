---
title: "StorageReservationOptions"
description: "StorageReservationOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **StorageReservationOptions**. See the [storage reservations guide](../../operations/storage-retention/) for behavior, defaults and examples.

## Import

```ts
import type { StorageReservationOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface StorageReservationOptions {
  readonly maxBytes: number;
  readonly reserveBytes: number;
  readonly maxEntries?: number;
  readonly signal?: AbortSignal;
}
```
