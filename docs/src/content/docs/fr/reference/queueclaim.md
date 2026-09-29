---
title: "QueueClaim"
description: "QueueClaim — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueClaim } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                | Présence | Rôle                                                                                                            |
| ---------- | ------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `worker`   | `string`            | Requis   | Nom du worker qui prend le job en charge, enregistré sur le job et vérifié par renew() et complete().           |
| `handlers` | `readonly string[]` | Requis   | Noms des handlers que ce worker sait exécuter, de 1 à 100 ; seuls les jobs de ces handlers sont pris en charge. |
| `leaseMs`  | `number`            | Requis   | Durée du bail en millisecondes, de 30 à 300000.                                                                 |

## Signature

```ts
export interface QueueClaim {
  readonly worker: string;
  readonly handlers: readonly string[];
  readonly leaseMs: number;
}
```
