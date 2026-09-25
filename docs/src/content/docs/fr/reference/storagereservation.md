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

| Nom                     | Type                  | Présence | Rôle                                                                                                              |
| ----------------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `id`                    | `string`              | Requis   | Identité unique de cette réservation coordonnée de stockage.                                                      |
| `repository`            | `string`              | Requis   | Checkout Git hôte ciblé.                                                                                          |
| `reserveBytes`          | `number`              | Requis   | Octets supplémentaires demandés à l’admission en plus du stockage déjà utilisé.                                   |
| `release`               | `() => Promise<void>` | Requis   | Libère cette réservation coordonnée afin que les autres écrivains coopératifs retrouvent sa capacité d’admission. |
| `[Symbol.asyncDispose]` | `() => Promise<void>` | Requis   | Ferme cette ressource via le mécanisme de libération asynchrone JavaScript.                                       |

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
