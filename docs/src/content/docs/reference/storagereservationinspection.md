---
title: "StorageReservationInspection"
description: "StorageReservationInspection — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StorageReservationInspection } from "@elie-laloum/outpost/recovery";
```

## Parameters and properties

| Name           | Type                                                 | Presence | Meaning                                                                                                          |
| -------------- | ---------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `revision`     | `string \| undefined`                                | Optional | Opaque revision of the entire inspected ledger, required for conditional recovery. Absent when no ledger exists. |
| `reservations` | `Readonly<Record<string, StorageReservationRecord>>` | Required | Reservation IDs mapped to their byte claims and available owner records.                                         |

## Signature

```ts
export interface StorageReservationInspection {
  readonly revision?: string;
  readonly reservations: Readonly<Record<string, StorageReservationRecord>>;
}
```

## Related contracts

- [StorageReservationRecord](../storagereservationrecord/)
