---
title: "StorageReservationRecoveryOptions"
description: "StorageReservationRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StorageReservationRecoveryOptions } from "@elie-laloum/outpost/recovery";
```

## Paramètres et propriétés

| Nom                | Type     | Présence | Rôle                                                                                                                                                  |
| ------------------ | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | `string` | Requis   | Identifiant exact de réservation choisi dans l’inspection.                                                                                            |
| `revision`         | `string` | Requis   | Révision exacte du registre renvoyée par l’inspection ; toute mutation intermédiaire l’invalide.                                                      |
| `processesStopped` | `true`   | Requis   | Confirmation explicite de l’arrêt du propriétaire sélectionné ; pour les anciennes entrées, arrêter tous les écrivains potentiels avant récupération. |

## Signature

```ts
export interface StorageReservationRecoveryOptions {
  readonly id: string;
  readonly revision: string;
  readonly processesStopped: true;
}
```
