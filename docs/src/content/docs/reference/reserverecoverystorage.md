---
title: "reserveRecoveryStorage"
description: "reserveRecoveryStorage — Outpost API"
sidebar:
  order: 10
---

Public contract for **reserveRecoveryStorage**. See the [storage reservations guide](../../guide/operations/storage-retention/) for behavior, defaults and examples.

## Import

```ts
import { reserveRecoveryStorage } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate cooperating writers with explicit storage reservations.

Reservations are admission coordination, not physical quotas. Their owner must release them; workspace ownership can bind their lifecycle.

[Complete example and detailed rules](../../guide/operations/storage-retention/).

## Parameters and properties

| Name                   | Type                                | Presence | Meaning                                                                                  |
| ---------------------- | ----------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`              | `RecoveryStorageReservationOptions` | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.repository`   | `string \| undefined`               | Optional | Target host Git checkout.                                                                |
| `options.maxBytes`     | `number`                            | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.reserveBytes` | `number`                            | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.maxEntries`   | `number \| undefined`               | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.signal`       | `AbortSignal \| undefined`          | Optional | Cooperative cancellation for this operation.                                             |

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
