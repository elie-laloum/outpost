---
title: "StorageReservationInspection"
description: "StorageReservationInspection — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StorageReservationInspection } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                 | Présence  | Rôle                                                                                                                         |
| -------------- | ---------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `revision`     | `string \| undefined`                                | Optionnel | Révision opaque du registre entier inspecté, exigée pour la récupération conditionnelle. Absente si aucun registre n’existe. |
| `reservations` | `Readonly<Record<string, StorageReservationRecord>>` | Requis    | Identifiants de réservation associés aux octets réservés et aux propriétaires disponibles.                                   |

## Signature

```ts
export interface StorageReservationInspection {
  readonly revision?: string;
  readonly reservations: Readonly<Record<string, StorageReservationRecord>>;
}
```

## Contrats associés

- [StorageReservationRecord](../storagereservationrecord/)
