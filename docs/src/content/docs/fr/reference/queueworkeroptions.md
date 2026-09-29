---
title: "QueueWorkerOptions"
description: "QueueWorkerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueWorkerOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                     | Présence  | Rôle                                                                                                                                               |
| ---------- | ---------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queue`    | `TaskQueue`                              | Requis    | File où le worker prend les jobs et enregistre leurs résultats.                                                                                    |
| `worker`   | `string`                                 | Requis    | Nom du worker enregistré sur chaque job pris en charge, de 1 à 512 caractères ; donnez-en un distinct à chaque processus.                          |
| `handlers` | `Readonly<Record<string, QueueHandler>>` | Requis    | Handlers par nom, de 1 à 100 ; le worker ne prend en charge que les jobs dont le handler figure ici.                                               |
| `signal`   | `AbortSignal`                            | Requis    | Arrête le worker : runQueueWorker() se résout et le signal du handler en cours s’interrompt. Ce job reste active jusqu’à l’expiration de son bail. |
| `leaseMs`  | `number \| undefined`                    | Optionnel | Durée du bail en millisecondes, 30000 par défaut, de 30 à 300000 ; renouvelé à chaque tiers de cette durée.                                        |
| `pollMs`   | `number \| undefined`                    | Optionnel | Attente en millisecondes quand aucun job n’est éligible, 250 par défaut ; doit être positive.                                                      |

## Signature

```ts
export interface QueueWorkerOptions {
  readonly queue: TaskQueue;
  readonly worker: string;
  readonly handlers: Readonly<Record<string, QueueHandler>>;
  readonly signal: AbortSignal;
  readonly leaseMs?: number;
  readonly pollMs?: number;
}
```

## Contrats associés

- [QueueHandler](../queuehandler/)
- [TaskQueue](../taskqueue/)
