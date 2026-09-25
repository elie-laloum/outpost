---
title: "StorageReservationOptions"
description: "StorageReservationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StorageReservationOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                       | Présence  | Rôle                                                                                      |
| -------------- | -------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `maxBytes`     | `number`                   | Requis    | Total maximal admis du stockage observé et des réservations actives, en octets.           |
| `reserveBytes` | `number`                   | Requis    | Octets supplémentaires demandés à l’admission en plus du stockage déjà utilisé.           |
| `maxEntries`   | `number \| undefined`      | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet. |
| `signal`       | `AbortSignal \| undefined` | Optionnel | Annulation coopérative de cette opération.                                                |

## Signature

```ts
export interface StorageReservationOptions {
  readonly maxBytes: number;
  readonly reserveBytes: number;
  readonly maxEntries?: number;
  readonly signal?: AbortSignal;
}
```
