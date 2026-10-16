---
title: "recoverStorageReservation"
description: "recoverStorageReservation — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoverStorageReservation } from "@elie-laloum/outpost";
```

## Purpose and behavior

Remove one inspected reservation after explicit confirmation that its owner stopped. Require the exact ledger revision and use a conditional write; concurrent changes reject with TransportConflict. Other entries remain intact. Legacy entries require stopping all potential owners because their identity is unknown. Never infer remote liveness from a PID.

[Complete example and detailed rules](../../guide/retention/).

## Parameters and properties

| Name                       | Type                                | Presence | Meaning                                                                                                                |
| -------------------------- | ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `transporter`              | `Transport`                         | Required | The same Transport used to inspect the reservation ledger.                                                             |
| `options`                  | `StorageReservationRecoveryOptions` | Required | Reservation identity, inspected ledger revision and explicit stopped-owner authorization.                              |
| `options.id`               | `string`                            | Required | Exact reservation ID selected from the inspection.                                                                     |
| `options.revision`         | `string`                            | Required | Exact ledger revision returned by inspection; any intervening mutation invalidates it.                                 |
| `options.processesStopped` | `true`                              | Required | Explicit confirmation that the selected owner stopped; for legacy entries, stop all potential writers before recovery. |

## Returns

`Promise<void>`

## Signature

```ts
export declare function recoverStorageReservation(
  transporter: Transport,
  options: StorageReservationRecoveryOptions,
): Promise<void>;
```

## Related contracts

- [StorageReservationRecoveryOptions](../storagereservationrecoveryoptions/)
- [Transport](../transport/)
