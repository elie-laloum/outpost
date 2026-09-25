---
title: "StorageReservation"
description: "StorageReservation — Outpost API"
sidebar:
  order: 10
---

Public contract for **StorageReservation**. See the [storage reservations guide](../../guide/operations/storage-retention/) for behavior, defaults and examples.

## Import

```ts
import type { StorageReservation } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate cooperating writers with explicit storage reservations.

Reservations are admission coordination, not physical quotas. Their owner must release them; workspace ownership can bind their lifecycle.

[Complete example and detailed rules](../../guide/operations/storage-retention/).

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                 |
| -------------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `id`           | `string`              | Required | See the linked contract and this family's rules for its interpretation. |
| `repository`   | `string`              | Required | Target host Git checkout.                                               |
| `reserveBytes` | `number`              | Required | See the linked contract and this family's rules for its interpretation. |
| `release`      | `() => Promise<void>` | Required | See the linked contract and this family's rules for its interpretation. |

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
