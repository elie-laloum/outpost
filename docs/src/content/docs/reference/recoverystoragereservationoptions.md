---
title: "RecoveryStorageReservationOptions"
description: "RecoveryStorageReservationOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryStorageReservationOptions**. See the [storage reservations guide](../../operations/storage-retention/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryStorageReservationOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryStorageReservationOptions extends StorageReservationOptions {
  readonly repository?: string;
}
```

## Related contracts

- [StorageReservationOptions](../storagereservationoptions/)
