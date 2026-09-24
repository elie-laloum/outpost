---
title: "reserveRecoveryStorage"
description: "reserveRecoveryStorage — Outpost API"
sidebar:
  order: 10
---

Contrat public de **reserveRecoveryStorage**. Consultez le [guide réservations de stockage](../../operations/storage-retention/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { reserveRecoveryStorage } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function reserveRecoveryStorage(
  options: RecoveryStorageReservationOptions,
): Promise<StorageReservation>;
```

## Contrats associés

- [RecoveryStorageReservationOptions](../recoverystoragereservationoptions/)
- [StorageReservation](../storagereservation/)
