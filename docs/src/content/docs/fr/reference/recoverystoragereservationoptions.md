---
title: "RecoveryStorageReservationOptions"
description: "RecoveryStorageReservationOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryStorageReservationOptions**. Consultez le [guide réservations de stockage](../../operations/storage-retention/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryStorageReservationOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryStorageReservationOptions extends StorageReservationOptions {
  readonly repository?: string;
}
```

## Contrats associés

- [StorageReservationOptions](../storagereservationoptions/)
