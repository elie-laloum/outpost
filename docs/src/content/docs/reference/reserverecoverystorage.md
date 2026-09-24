---
title: "reserveRecoveryStorage"
description: "reserveRecoveryStorage — Outpost API"
sidebar:
  order: 10
---

Public contract for **reserveRecoveryStorage**. See the [storage reservations guide](../../operations/storage-retention/) for behavior, defaults and examples.

## Import

```ts
import { reserveRecoveryStorage } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function reserveRecoveryStorage(
  options: RecoveryStorageReservationOptions,
): Promise<StorageReservation>;
```

## Related contracts

- [RecoveryStorageReservationOptions](../recoverystoragereservationoptions/)
- [StorageReservation](../storagereservation/)
