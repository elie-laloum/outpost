---
title: "reserveRecoveryStorage"
description: "reserveRecoveryStorage — Outpost API"
sidebar:
  order: 10
---

Contrat public de **reserveRecoveryStorage**. Consultez le [guide réservations de stockage](../../guide/operations/storage-retention/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { reserveRecoveryStorage } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner les écrivains coopératifs avec des réservations de stockage explicites.

Les réservations coordonnent l’admission, sans quota physique. Leur propriétaire doit les libérer ; un workspace peut posséder leur durée de vie.

[Exemple complet et règles détaillées](../../guide/operations/storage-retention/).

## Paramètres et propriétés

| Nom                    | Type                                | Présence  | Rôle                                                                                          |
| ---------------------- | ----------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`              | `RecoveryStorageReservationOptions` | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.repository`   | `string \| undefined`               | Optionnel | Checkout Git hôte ciblé.                                                                      |
| `options.maxBytes`     | `number`                            | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.reserveBytes` | `number`                            | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.maxEntries`   | `number \| undefined`               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.signal`       | `AbortSignal \| undefined`          | Optionnel | Annulation coopérative de cette opération.                                                    |

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
