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

| Nom            | Type                       | Présence  | Rôle                                                                                                                                                                                                 |
| -------------- | -------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`   | `string \| undefined`      | Optionnel | Checkout Git hôte ciblé.                                                                                                                                                                             |
| `transporter`  | `Transport \| undefined`   | Optionnel | Transport optionnel dont les contenus et le registre partagé remplacent le calcul local d’admission. Les réservations persistent jusqu’à libération explicite et n’imposent pas de quotas physiques. |
| `maxBytes`     | `number`                   | Requis    | Total maximal admis du stockage observé et des réservations actives, en octets.                                                                                                                      |
| `reserveBytes` | `number`                   | Requis    | Octets supplémentaires demandés à l’admission en plus du stockage déjà utilisé.                                                                                                                      |
| `maxEntries`   | `number \| undefined`      | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet.                                                                                                            |
| `signal`       | `AbortSignal \| undefined` | Optionnel | Annulation coopérative de cette opération.                                                                                                                                                           |

## Signature

```ts
export interface RecoveryStorageReservationOptions extends StorageReservationOptions {
  readonly repository?: string;
}
```

## Contrats associés

- [StorageReservationOptions](../storagereservationoptions/)
