---
title: "RecoveryQuotaOptions"
description: "RecoveryQuotaOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryQuotaOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                                      |
| -------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `repository`   | `string \| undefined` | Optionnel | Checkout Git hôte ciblé.                                                                  |
| `maxBytes`     | `number`              | Requis    | Total maximal admis du stockage observé et des réservations actives, en octets.           |
| `reserveBytes` | `number \| undefined` | Optionnel | Octets supplémentaires demandés à l’admission en plus du stockage déjà utilisé.           |
| `maxEntries`   | `number \| undefined` | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet. |

## Signature

```ts
export interface RecoveryQuotaOptions {
  readonly repository?: string;
  readonly maxBytes: number;
  readonly reserveBytes?: number;
  readonly maxEntries?: number;
}
```
