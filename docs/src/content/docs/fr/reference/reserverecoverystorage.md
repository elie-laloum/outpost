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

Réserve une capacité coopérative dans un registre conditionnel via Transport. Par défaut, createLocalTransport conserve le registre sous .outpost/storage et l’admission mesure les fichiers locaux ; un transport explicite mesure ses contenus. La libération est idempotente. Une réservation abandonnée exige une récupération conditionnelle explicite après confirmation de l’arrêt du propriétaire.

[Exemple complet et règles détaillées](../../guide/operations/storage-retention/).

## Paramètres et propriétés

| Nom                    | Type                                | Présence  | Rôle                                                                                                                                                                                                                                                                                 |
| ---------------------- | ----------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`              | `RecoveryStorageReservationOptions` | Requis    | Dépôt, limite d’admission du stockage, octets à réserver et annulation de l’acquisition.                                                                                                                                                                                             |
| `options.repository`   | `string \| undefined`               | Optionnel | Checkout Git hôte ciblé.                                                                                                                                                                                                                                                             |
| `options.transporter`  | `Transport \| undefined`            | Optionnel | Transport du registre conditionnel de réservations. Par défaut : createLocalTransport sous .outpost/storage avec mesure des fichiers du dépôt. Un transport explicite mesure les contenus objets. Les réservations abandonnées exigent une récupération explicite dans les deux cas. |
| `options.maxBytes`     | `number`                            | Requis    | Total maximal admis du stockage observé et des réservations actives, en octets.                                                                                                                                                                                                      |
| `options.reserveBytes` | `number`                            | Requis    | Octets supplémentaires demandés à l’admission en plus du stockage déjà utilisé.                                                                                                                                                                                                      |
| `options.maxEntries`   | `number \| undefined`               | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet.                                                                                                                                                                                            |
| `options.signal`       | `AbortSignal \| undefined`          | Optionnel | Annulation coopérative de cette opération.                                                                                                                                                                                                                                           |

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
