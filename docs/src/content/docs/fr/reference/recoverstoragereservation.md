---
title: "recoverStorageReservation"
description: "recoverStorageReservation — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoverStorageReservation } from "@elie-laloum/outpost/recovery";
```

## Rôle et comportement

Retire une réservation inspectée après confirmation explicite de l’arrêt de son propriétaire. Exige la révision exacte du registre et une écriture conditionnelle ; une modification concurrente rejette avec TransportConflict. Les autres entrées restent intactes. Les anciennes entrées exigent l’arrêt de tous les propriétaires potentiels car leur identité est inconnue. Ne déduit jamais l’activité distante d’un PID.

[Exemple complet et règles détaillées](../../guide/retention/).

## Paramètres et propriétés

| Nom                        | Type                                | Présence | Rôle                                                                                                                                                  |
| -------------------------- | ----------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter`              | `Transport`                         | Requis   | Le même Transport que celui utilisé pour inspecter le registre de réservations.                                                                       |
| `options`                  | `StorageReservationRecoveryOptions` | Requis   | Identifiant de réservation, révision inspectée du registre et autorisation explicite après arrêt du propriétaire.                                     |
| `options.id`               | `string`                            | Requis   | Identifiant exact de réservation choisi dans l’inspection.                                                                                            |
| `options.revision`         | `string`                            | Requis   | Révision exacte du registre renvoyée par l’inspection ; toute mutation intermédiaire l’invalide.                                                      |
| `options.processesStopped` | `true`                              | Requis   | Confirmation explicite de l’arrêt du propriétaire sélectionné ; pour les anciennes entrées, arrêter tous les écrivains potentiels avant récupération. |

## Retour

`Promise<void>`

## Signature

```ts
export declare function recoverStorageReservation(
  transporter: Transport,
  options: StorageReservationRecoveryOptions,
): Promise<void>;
```

## Contrats associés

- [StorageReservationRecoveryOptions](../storagereservationrecoveryoptions/)
- [Transport](../transport/)
