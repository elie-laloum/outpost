---
title: "reserveRecoveryStorage"
description: "reserveRecoveryStorage — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { reserveRecoveryStorage } from "@elie-laloum/outpost";
```

## Purpose and behavior

Acquire a coordinated recovery-storage reservation after checking observed usage and other active reservations. The caller must release the returned reservation; it coordinates cooperating processes without reserving physical disk blocks.

[Complete example and detailed rules](../../guide/operations/storage-retention/).

## Parameters and properties

| Name                   | Type                                | Presence | Meaning                                                                             |
| ---------------------- | ----------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `options`              | `RecoveryStorageReservationOptions` | Required | Repository, storage admission limit, bytes to reserve and acquisition cancellation. |
| `options.repository`   | `string \| undefined`               | Optional | Target host Git checkout.                                                           |
| `options.maxBytes`     | `number`                            | Required | Maximum admitted total of observed storage and active reservations, in bytes.       |
| `options.reserveBytes` | `number`                            | Required | Additional bytes requested for admission alongside existing storage usage.          |
| `options.maxEntries`   | `number \| undefined`               | Optional | Maximum filesystem entries inspected before marking the inventory incomplete.       |
| `options.signal`       | `AbortSignal \| undefined`          | Optional | Cooperative cancellation for this operation.                                        |

## Returns

`Promise<StorageReservation>`

## Signature

```ts
export declare function reserveRecoveryStorage(
  options: RecoveryStorageReservationOptions,
): Promise<StorageReservation>;
```

## Related contracts

- [RecoveryStorageReservationOptions](../recoverystoragereservationoptions/)
- [StorageReservation](../storagereservation/)
