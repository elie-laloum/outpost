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

| Nom        | Type                | Présence | Rôle                                                                           |
| ---------- | ------------------- | -------- | ------------------------------------------------------------------------------ |
| `worker`   | `string`            | Requis   | Identité du worker prenant en charge ou possédant le bail du travail.          |
| `handlers` | `readonly string[]` | Requis   | Noms des gestionnaires que ce worker peut exécuter lors de la prise en charge. |
| `leaseMs`  | `number`            | Requis   | Durée du bail worker en millisecondes.                                         |

## Signature

```ts
export interface QueueClaim {
  readonly worker: string;
  readonly handlers: readonly string[];
  readonly leaseMs: number;
}
```
