---
title: "StorageReservation"
description: "StorageReservation — Outpost API"
sidebar:
  order: 10
---

Public contract for **StorageReservation**. See the [storage reservations guide](../../operations/storage-retention/) for behavior, defaults and examples.

## Import

```ts
import type { StorageReservation } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface StorageReservation {
  readonly id: string;
  readonly repository: string;
  readonly reserveBytes: number;
  release(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
```
