---
title: "reserveRecoveryStorage"
description: "reserveRecoveryStorage — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { reserveRecoveryStorage } from "@elie-laloum/outpost";
```

## Rôle et comportement

Acquiert une réservation coordonnée de stockage après contrôle de l’usage observé et des autres réservations actives. L’appelant doit libérer la réservation renvoyée ; elle coordonne les processus coopératifs sans réserver physiquement des blocs disque.

[Exemple complet et règles détaillées](../../guide/operations/storage-retention/).

## Paramètres et propriétés

| Nom                    | Type                                | Présence  | Rôle                                                                                      |
| ---------------------- | ----------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `options`              | `RecoveryStorageReservationOptions` | Requis    | Dépôt, limite d’admission du stockage, octets à réserver et annulation de l’acquisition.  |
| `options.repository`   | `string \| undefined`               | Optionnel | Checkout Git hôte ciblé.                                                                  |
| `options.maxBytes`     | `number`                            | Requis    | Total maximal admis du stockage observé et des réservations actives, en octets.           |
| `options.reserveBytes` | `number`                            | Requis    | Octets supplémentaires demandés à l’admission en plus du stockage déjà utilisé.           |
| `options.maxEntries`   | `number \| undefined`               | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet. |
| `options.signal`       | `AbortSignal \| undefined`          | Optionnel | Annulation coopérative de cette opération.                                                |

## Retour

`Promise<StorageReservation>`

## Signature

```ts
export declare function reserveRecoveryStorage(
  options: RecoveryStorageReservationOptions,
): Promise<StorageReservation>;
```

## Contrats associés

- [RecoveryStorageReservationOptions](../recoverystoragereservationoptions/)
- [StorageReservation](../storagereservation/)
