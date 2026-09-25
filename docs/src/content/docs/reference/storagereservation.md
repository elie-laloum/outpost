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

| Name                    | Type                  | Presence | Meaning                                                                                               |
| ----------------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `id`                    | `string`              | Required | Unique identity of this coordinated storage reservation.                                              |
| `repository`            | `string`              | Required | Target host Git checkout.                                                                             |
| `reserveBytes`          | `number`              | Required | Additional bytes requested for admission alongside existing storage usage.                            |
| `release`               | `() => Promise<void>` | Required | Release this coordinated reservation so other cooperating writers can reclaim its admission capacity. |
| `[Symbol.asyncDispose]` | `() => Promise<void>` | Required | Close this resource through JavaScript asynchronous resource disposal.                                |

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
