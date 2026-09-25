---
title: "StorageReservation"
description: "StorageReservation — Outpost API"
sidebar:
  order: 10
---

Contrat public de **StorageReservation**. Consultez le [guide réservations de stockage](../../guide/operations/storage-retention/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { StorageReservation } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner les écrivains coopératifs avec des réservations de stockage explicites.

Les réservations coordonnent l’admission, sans quota physique. Leur propriétaire doit les libérer ; un workspace peut posséder leur durée de vie.

[Exemple complet et règles détaillées](../../guide/operations/storage-retention/).

## Paramètres et propriétés

| Nom            | Type                  | Présence | Rôle                                                                             |
| -------------- | --------------------- | -------- | -------------------------------------------------------------------------------- |
| `id`           | `string`              | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `repository`   | `string`              | Requis   | Checkout Git hôte ciblé.                                                         |
| `reserveBytes` | `number`              | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `release`      | `() => Promise<void>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
