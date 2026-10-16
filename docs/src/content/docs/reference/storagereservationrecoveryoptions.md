---
title: "StorageReservationRecoveryOptions"
description: "StorageReservationRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StorageReservationRecoveryOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type     | Presence | Meaning                                                                                                                |
| ------------------ | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `id`               | `string` | Required | Exact reservation ID selected from the inspection.                                                                     |
| `revision`         | `string` | Required | Exact ledger revision returned by inspection; any intervening mutation invalidates it.                                 |
| `processesStopped` | `true`   | Required | Explicit confirmation that the selected owner stopped; for legacy entries, stop all potential writers before recovery. |

## Signature

```ts
export interface StorageReservationRecoveryOptions {
  readonly id: string;
  readonly revision: string;
  readonly processesStopped: true;
}
```
