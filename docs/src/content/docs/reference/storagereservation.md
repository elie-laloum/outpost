---
title: "StorageReservation"
description: "StorageReservation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StorageReservation } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                  | Presence | Meaning                                                                                                                               |
| ----------------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                    | `string`              | Required | Random UUID that keys this reservation in reservations/ledger.                                                                        |
| `repository`            | `string`              | Required | Top-level directory of the resolved Git checkout.                                                                                     |
| `reserveBytes`          | `number`              | Required | Bytes this reservation holds in the ledger.                                                                                           |
| `release`               | `() => Promise<void>` | Required | Remove this entry from the ledger with a conditional write. Later calls resolve without effect; a release that failed can be retried. |
| `[Symbol.asyncDispose]` | `() => Promise<void>` | Required | Same as release(), so an await using scope releases the reservation when it ends.                                                     |

## Signature

```ts
export interface StorageReservation {
  readonly id: string;
  readonly repository: string;
  readonly reserveBytes: number;
  release(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
```
