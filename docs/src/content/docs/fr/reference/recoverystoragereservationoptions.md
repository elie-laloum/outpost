---
title: "RecoveryStorageReservationOptions"
description: "RecoveryStorageReservationOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryStorageReservationOptions**. Consultez le [guide réservations de stockage](../../guide/operations/storage-retention/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryStorageReservationOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner les écrivains coopératifs avec des réservations de stockage explicites.

Les réservations coordonnent l’admission, sans quota physique. Leur propriétaire doit les libérer ; un workspace peut posséder leur durée de vie.

[Exemple complet et règles détaillées](../../guide/operations/storage-retention/).

## Paramètres et propriétés

| Nom            | Type                       | Présence  | Rôle                                                                             |
| -------------- | -------------------------- | --------- | -------------------------------------------------------------------------------- |
| `repository`   | `string \| undefined`      | Optionnel | Checkout Git hôte ciblé.                                                         |
| `maxBytes`     | `number`                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `reserveBytes` | `number`                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `maxEntries`   | `number \| undefined`      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `signal`       | `AbortSignal \| undefined` | Optionnel | Annulation coopérative de cette opération.                                       |

## Signature

```ts
export interface RecoveryStorageReservationOptions extends StorageReservationOptions {
  readonly repository?: string;
}
```

## Contrats associés

- [StorageReservationOptions](../storagereservationoptions/)
