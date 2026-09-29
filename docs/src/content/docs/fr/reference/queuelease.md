---
title: "QueueLease"
description: "QueueLease — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueLease } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type     | Présence | Rôle                                                                                                    |
| -------- | -------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `id`     | `string` | Requis   | Identifiant du job sous bail.                                                                           |
| `worker` | `string` | Requis   | Nom du worker qui détient le bail.                                                                      |
| `fence`  | `number` | Requis   | Fence renvoyé par la prise en charge ; une prise en charge ultérieure ou une annulation le rend périmé. |

## Signature

```ts
export interface QueueLease {
  readonly id: string;
  readonly worker: string;
  readonly fence: number;
}
```
