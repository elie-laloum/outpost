---
title: "StorageReservationOptions"
description: "StorageReservationOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **StorageReservationOptions**. Consultez le [guide réservations de stockage](../../operations/storage-retention/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { StorageReservationOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface StorageReservationOptions {
  readonly maxBytes: number;
  readonly reserveBytes: number;
  readonly maxEntries?: number;
  readonly signal?: AbortSignal;
}
```
