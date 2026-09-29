---
title: "StorageReservationOptions"
description: "StorageReservationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StorageReservationOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                       | Presence | Meaning                                                                                                                                                                                                                                                                |
| -------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter`  | `Transport \| undefined`   | Optional | Transport for the conditional reservation ledger. Defaults to createLocalTransport under the repository’s .outpost/storage with filesystem usage accounting. An explicit transport measures object payloads. Abandoned claims require explicit recovery in both cases. |
| `maxBytes`     | `number`                   | Required | Maximum admitted total of observed storage and active reservations, in bytes.                                                                                                                                                                                          |
| `reserveBytes` | `number`                   | Required | Additional bytes requested for admission alongside existing storage usage.                                                                                                                                                                                             |
| `maxEntries`   | `number \| undefined`      | Optional | Maximum filesystem entries inspected before marking the inventory incomplete.                                                                                                                                                                                          |
| `signal`       | `AbortSignal \| undefined` | Optional | Cooperative cancellation for this operation.                                                                                                                                                                                                                           |

## Signature

```ts
export interface StorageReservationOptions {
  readonly transporter?: Transport;
  readonly maxBytes: number;
  readonly reserveBytes: number;
  readonly maxEntries?: number;
  readonly signal?: AbortSignal;
}
```

## Related contracts

- [Transport](../transport/)
