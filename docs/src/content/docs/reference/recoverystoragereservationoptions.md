---
title: "RecoveryStorageReservationOptions"
description: "RecoveryStorageReservationOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryStorageReservationOptions**. See the [storage reservations guide](../../guide/operations/storage-retention/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryStorageReservationOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate cooperating writers with explicit storage reservations.

Reservations are admission coordination, not physical quotas. Their owner must release them; workspace ownership can bind their lifecycle.

[Complete example and detailed rules](../../guide/operations/storage-retention/).

## Parameters and properties

| Name           | Type                       | Presence | Meaning                                                                 |
| -------------- | -------------------------- | -------- | ----------------------------------------------------------------------- |
| `repository`   | `string \| undefined`      | Optional | Target host Git checkout.                                               |
| `maxBytes`     | `number`                   | Required | See the linked contract and this family's rules for its interpretation. |
| `reserveBytes` | `number`                   | Required | See the linked contract and this family's rules for its interpretation. |
| `maxEntries`   | `number \| undefined`      | Optional | See the linked contract and this family's rules for its interpretation. |
| `signal`       | `AbortSignal \| undefined` | Optional | Cooperative cancellation for this operation.                            |

## Signature

```ts
export interface RecoveryStorageReservationOptions extends StorageReservationOptions {
  readonly repository?: string;
}
```

## Related contracts

- [StorageReservationOptions](../storagereservationoptions/)
