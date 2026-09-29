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

Inscrit reserveBytes dans le registre de réservations du dépôt quand l’usage observé, les réservations actives et la demande tiennent dans maxBytes, puis renvoie la réservation. Un refus, un inventaire incomplet, des options invalides ou un registre malformé rejettent avec le code configuration. L’entrée compte jusqu’à release() et n’expire jamais ; Outpost ne fournit aucun appel pour effacer une réservation abandonnée.

[Exemple complet et règles détaillées](../../guide/retention/).

## Paramètres et propriétés

| Nom                    | Type                                | Présence  | Rôle                                                                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `RecoveryStorageReservationOptions` | Requis    | Dépôt, limite en octets, octets à réserver, transport du registre, limite d’inventaire et annulation.                                                                                                                                                         |
| `options.repository`   | `string \| undefined`               | Optionnel | Checkout Git dont les écrivains partagent le registre, process.cwd() par défaut, résolu vers son répertoire racine. Sans transporter, son .outpost contient le registre et sert à mesurer l’usage ; un répertoire absent rejette avec le code workspace.      |
| `options.transporter`  | `Transport \| undefined`            | Optionnel | Transport qui stocke reservations/ledger ; la taille de tous ses autres objets compte comme usage. Par défaut : createLocalTransport sous .outpost/storage, avec un usage mesuré sur les fichiers sous .outpost/recovery, logs, locks, workspaces et storage. |
| `options.maxBytes`     | `number`                            | Requis    | Limite de l’usage observé, des réservations actives et de cette demande réunis, en octets ; au-delà, l’admission rejette avec le code configuration. Doit être un entier sûr positif ou nul.                                                                  |
| `options.reserveBytes` | `number`                            | Requis    | Octets que cette réservation occupe dans le registre jusqu’à sa libération. Doit être un entier sûr positif ou nul.                                                                                                                                           |
| `options.maxEntries`   | `number \| undefined`               | Optionnel | Nombre maximal de fichiers et répertoires parcourus sous .outpost, ou d’objets listés depuis un transporter explicite, 100000 par défaut. Au-delà, l’admission rejette avec le code configuration.                                                            |
| `options.signal`       | `AbortSignal \| undefined`          | Optionnel | Annule l’admission avec la raison de l’annulation tant que l’entrée n’est pas écrite. release() l’ignore.                                                                                                                                                     |

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
