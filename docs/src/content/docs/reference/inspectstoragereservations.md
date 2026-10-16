---
title: "inspectStorageReservations"
description: "inspectStorageReservations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectStorageReservations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read and validate a Transport reservation ledger, returning its revision and entries with available owner metadata. An absent ledger returns no revision and no entries; legacy entries retain their byte count without inventing an owner. This operation makes no liveness decision and changes nothing.

[Complete example and detailed rules](../../guide/retention/).

## Parameters and properties

| Name          | Type        | Presence | Meaning                                                                         |
| ------------- | ----------- | -------- | ------------------------------------------------------------------------------- |
| `transporter` | `Transport` | Required | Transport holding the reservations/ledger object; the caller owns its lifetime. |

## Returns

`Promise<StorageReservationInspection>`

## Signature

```ts
export declare function inspectStorageReservations(
  transporter: Transport,
): Promise<StorageReservationInspection>;
```

## Related contracts

- [StorageReservationInspection](../storagereservationinspection/)
- [Transport](../transport/)
