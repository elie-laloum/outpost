---
title: "StorageReservation"
description: "StorageReservation — Outpost API"
sidebar:
  order: 10
---

Contrat public de **StorageReservation**. Consultez le [guide réservations de stockage](../../operations/storage-retention/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { StorageReservation } from "@elie-laloum/outpost";
```

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
