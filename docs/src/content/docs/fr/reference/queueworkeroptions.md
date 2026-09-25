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

| Nom        | Type                                     | Présence  | Rôle                                                                                     |
| ---------- | ---------------------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `queue`    | `TaskQueue`                              | Requis    | File de tâches utilisée pour envoyer, prendre en charge et persister l’état des travaux. |
| `worker`   | `string`                                 | Requis    | Identité du worker prenant en charge ou possédant le bail du travail.                    |
| `handlers` | `Readonly<Record<string, QueueHandler>>` | Requis    | Registre associant noms de gestionnaires et callbacks d’exécution des travaux.           |
| `signal`   | `AbortSignal`                            | Requis    | Annulation coopérative de cette opération.                                               |
| `leaseMs`  | `number \| undefined`                    | Optionnel | Durée du bail worker en millisecondes.                                                   |
| `pollMs`   | `number \| undefined`                    | Optionnel | Intervalle en millisecondes entre les interrogations de la file.                         |

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
