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

Record reserveBytes in the repository's reservation ledger when observed usage, active reservations and the request fit within maxBytes, and return the reservation. Refusal, an incomplete inventory, invalid options or a malformed ledger reject with code configuration. The entry counts until release() and never expires; Outpost has no call to clear an abandoned one.

[Complete example and detailed rules](../../guide/retention/).

## Parameters and properties

| Name                   | Type                                | Presence | Meaning                                                                                                                                                                                                                                              |
| ---------------------- | ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `RecoveryStorageReservationOptions` | Required | Repository, byte limit, bytes to reserve, ledger transport, scan limit and cancellation.                                                                                                                                                             |
| `options.repository`   | `string \| undefined`               | Optional | Git checkout whose writers share the ledger, default process.cwd(), resolved to its top-level directory. Without transporter, its .outpost holds the ledger and is measured; a missing directory rejects with code workspace.                        |
| `options.transporter`  | `Transport \| undefined`            | Optional | Transport that stores reservations/ledger; the sizes of all its other objects count as usage. Default: createLocalTransport under .outpost/storage, with usage measured from the files under .outpost/recovery, logs, locks, workspaces and storage. |
| `options.maxBytes`     | `number`                            | Required | Limit for observed usage plus active reservations plus this request, in bytes; above it, admission rejects with code configuration. Must be a non-negative safe integer.                                                                             |
| `options.reserveBytes` | `number`                            | Required | Bytes this reservation holds in the ledger until it is released. Must be a non-negative safe integer.                                                                                                                                                |
| `options.maxEntries`   | `number \| undefined`               | Optional | Maximum files and directories scanned under .outpost, or objects listed from an explicit transporter, default 100000. Exceeding it rejects admission with code configuration.                                                                        |
| `options.signal`       | `AbortSignal \| undefined`          | Optional | Cancels admission with the abort reason until the entry is written. release() ignores it.                                                                                                                                                            |

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
