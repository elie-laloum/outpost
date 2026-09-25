---
title: "StorageReservationOptions"
description: "StorageReservationOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **StorageReservationOptions**. Consultez le [guide réservations de stockage](../../guide/operations/storage-retention/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { StorageReservationOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner les écrivains coopératifs avec des réservations de stockage explicites.

Les réservations coordonnent l’admission, sans quota physique. Leur propriétaire doit les libérer ; un workspace peut posséder leur durée de vie.

[Exemple complet et règles détaillées](../../guide/operations/storage-retention/).

## Paramètres et propriétés

| Nom            | Type                       | Présence  | Rôle                                                                             |
| -------------- | -------------------------- | --------- | -------------------------------------------------------------------------------- |
| `maxBytes`     | `number`                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `reserveBytes` | `number`                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `maxEntries`   | `number \| undefined`      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `signal`       | `AbortSignal \| undefined` | Optionnel | Annulation coopérative de cette opération.                                       |

## Signature

```ts
export interface StorageReservationOptions {
  readonly maxBytes: number;
  readonly reserveBytes: number;
  readonly maxEntries?: number;
  readonly signal?: AbortSignal;
}
```
