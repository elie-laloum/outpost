---
title: "RecoveryStorageReservationOptions"
description: "RecoveryStorageReservationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryStorageReservationOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                       | Presence | Meaning                                                                       |
| -------------- | -------------------------- | -------- | ----------------------------------------------------------------------------- |
| `repository`   | `string \| undefined`      | Optional | Target host Git checkout.                                                     |
| `maxBytes`     | `number`                   | Required | Maximum admitted total of observed storage and active reservations, in bytes. |
| `reserveBytes` | `number`                   | Required | Additional bytes requested for admission alongside existing storage usage.    |
| `maxEntries`   | `number \| undefined`      | Optional | Maximum filesystem entries inspected before marking the inventory incomplete. |
| `signal`       | `AbortSignal \| undefined` | Optional | Cooperative cancellation for this operation.                                  |

## Signature

```ts
export interface RecoveryStorageReservationOptions extends StorageReservationOptions {
  readonly repository?: string;
}
```

## Related contracts

- [StorageReservationOptions](../storagereservationoptions/)
