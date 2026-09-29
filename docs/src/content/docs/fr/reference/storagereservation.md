---
title: "StorageReservation"
description: "StorageReservation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StorageReservation } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                  | Présence | Rôle                                                                                                                                                       |
| ----------------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                    | `string`              | Requis   | UUID aléatoire qui identifie cette réservation dans reservations/ledger.                                                                                   |
| `repository`            | `string`              | Requis   | Répertoire racine du checkout Git résolu.                                                                                                                  |
| `reserveBytes`          | `number`              | Requis   | Octets que cette réservation occupe dans le registre.                                                                                                      |
| `release`               | `() => Promise<void>` | Requis   | Retire cette entrée du registre par une écriture conditionnelle. Les appels suivants se résolvent sans effet ; une libération en échec peut être relancée. |
| `[Symbol.asyncDispose]` | `() => Promise<void>` | Requis   | Équivaut à release() : un bloc await using libère la réservation à sa sortie.                                                                              |

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
