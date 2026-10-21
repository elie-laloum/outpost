---
title: "inspectStorageReservations"
description: "inspectStorageReservations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectStorageReservations } from "@elie-laloum/outpost/recovery";
```

## Rôle et comportement

Lit et valide le registre de réservations d’un Transport, puis renvoie sa révision et les entrées avec les métadonnées de propriétaire disponibles. Un registre absent renvoie des entrées vides sans révision ; les anciennes entrées conservent leur taille sans propriétaire inventé. Cette opération ne déduit aucune activité et ne modifie rien.

[Exemple complet et règles détaillées](../../guide/retention/).

## Paramètres et propriétés

| Nom           | Type        | Présence | Rôle                                                                               |
| ------------- | ----------- | -------- | ---------------------------------------------------------------------------------- |
| `transporter` | `Transport` | Requis   | Transport contenant l’objet reservations/ledger ; l’appelant gère sa durée de vie. |

## Retour

`Promise<StorageReservationInspection>`

## Signature

```ts
export declare function inspectStorageReservations(
  transporter: Transport,
): Promise<StorageReservationInspection>;
```

## Contrats associés

- [StorageReservationInspection](../storagereservationinspection/)
- [Transport](../transport/)
