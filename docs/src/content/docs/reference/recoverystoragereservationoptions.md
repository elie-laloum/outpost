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

| Name           | Type                       | Presence | Meaning                                                                                                                                                                                                                                              |
| -------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`   | `string \| undefined`      | Optional | Git checkout whose writers share the ledger, default process.cwd(), resolved to its top-level directory. Without transporter, its .outpost holds the ledger and is measured; a missing directory rejects with code workspace.                        |
| `transporter`  | `Transport \| undefined`   | Optional | Transport that stores reservations/ledger; the sizes of all its other objects count as usage. Default: createLocalTransport under .outpost/storage, with usage measured from the files under .outpost/recovery, logs, locks, workspaces and storage. |
| `maxBytes`     | `number`                   | Required | Limit for observed usage plus active reservations plus this request, in bytes; above it, admission rejects with code configuration. Must be a non-negative safe integer.                                                                             |
| `reserveBytes` | `number`                   | Required | Bytes this reservation holds in the ledger until it is released. Must be a non-negative safe integer.                                                                                                                                                |
| `maxEntries`   | `number \| undefined`      | Optional | Maximum files and directories scanned under .outpost, or objects listed from an explicit transporter, default 100000. Exceeding it rejects admission with code configuration.                                                                        |
| `signal`       | `AbortSignal \| undefined` | Optional | Cancels admission with the abort reason until the entry is written. release() ignores it.                                                                                                                                                            |

## Signature

```ts
export interface RecoveryStorageReservationOptions extends StorageReservationOptions {
  readonly repository?: string;
}
```

## Related contracts

- [StorageReservationOptions](../storagereservationoptions/)
