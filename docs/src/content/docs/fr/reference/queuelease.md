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

| Nom      | Type     | Présence | Rôle                                                                                  |
| -------- | -------- | -------- | ------------------------------------------------------------------------------------- |
| `id`     | `string` | Requis   | Identité durable du travail utilisée pour la déduplication et les opérations de bail. |
| `worker` | `string` | Requis   | Identité du worker prenant en charge ou possédant le bail du travail.                 |
| `fence`  | `number` | Requis   | Génération du bail utilisée pour rejeter les écritures périmées.                      |

## Signature

```ts
export interface QueueLease {
  readonly id: string;
  readonly worker: string;
  readonly fence: number;
}
```
