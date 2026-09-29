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

Reserve cooperative headroom in a conditional transport ledger. By default createLocalTransport stores the ledger under .outpost/storage and admission measures local runtime files; an explicit transport measures its payloads. Release is idempotent. Abandoned reservations require explicit conditional recovery after confirming the owner stopped.

[Complete example and detailed rules](../../guide/retention/).

## Parameters and properties

| Name                   | Type                                | Presence | Meaning                                                                                                                                                                                                                                                                |
| ---------------------- | ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `RecoveryStorageReservationOptions` | Required | Repository, storage admission limit, bytes to reserve and acquisition cancellation.                                                                                                                                                                                    |
| `options.repository`   | `string \| undefined`               | Optional | Target host Git checkout.                                                                                                                                                                                                                                              |
| `options.transporter`  | `Transport \| undefined`            | Optional | Transport for the conditional reservation ledger. Defaults to createLocalTransport under the repository’s .outpost/storage with filesystem usage accounting. An explicit transport measures object payloads. Abandoned claims require explicit recovery in both cases. |
| `options.maxBytes`     | `number`                            | Required | Maximum admitted total of observed storage and active reservations, in bytes.                                                                                                                                                                                          |
| `options.reserveBytes` | `number`                            | Required | Additional bytes requested for admission alongside existing storage usage.                                                                                                                                                                                             |
| `options.maxEntries`   | `number \| undefined`               | Optional | Maximum filesystem entries inspected before marking the inventory incomplete.                                                                                                                                                                                          |
| `options.signal`       | `AbortSignal \| undefined`          | Optional | Cooperative cancellation for this operation.                                                                                                                                                                                                                           |

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
