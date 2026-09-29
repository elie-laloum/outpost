---
title: "RecoveryStorageReservationOptions"
description: "RecoveryStorageReservationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryStorageReservationOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                       | Présence  | Rôle                                                                                                                                                                                                                                                          |
| -------------- | -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`   | `string \| undefined`      | Optionnel | Checkout Git dont les écrivains partagent le registre, process.cwd() par défaut, résolu vers son répertoire racine. Sans transporter, son .outpost contient le registre et sert à mesurer l’usage ; un répertoire absent rejette avec le code workspace.      |
| `transporter`  | `Transport \| undefined`   | Optionnel | Transport qui stocke reservations/ledger ; la taille de tous ses autres objets compte comme usage. Par défaut : createLocalTransport sous .outpost/storage, avec un usage mesuré sur les fichiers sous .outpost/recovery, logs, locks, workspaces et storage. |
| `maxBytes`     | `number`                   | Requis    | Limite de l’usage observé, des réservations actives et de cette demande réunis, en octets ; au-delà, l’admission rejette avec le code configuration. Doit être un entier sûr positif ou nul.                                                                  |
| `reserveBytes` | `number`                   | Requis    | Octets que cette réservation occupe dans le registre jusqu’à sa libération. Doit être un entier sûr positif ou nul.                                                                                                                                           |
| `maxEntries`   | `number \| undefined`      | Optionnel | Nombre maximal de fichiers et répertoires parcourus sous .outpost, ou d’objets listés depuis un transporter explicite, 100000 par défaut. Au-delà, l’admission rejette avec le code configuration.                                                            |
| `signal`       | `AbortSignal \| undefined` | Optionnel | Annule l’admission avec la raison de l’annulation tant que l’entrée n’est pas écrite. release() l’ignore.                                                                                                                                                     |

## Signature

```ts
export interface RecoveryStorageReservationOptions extends StorageReservationOptions {
  readonly repository?: string;
}
```

## Contrats associés

- [StorageReservationOptions](../storagereservationoptions/)
