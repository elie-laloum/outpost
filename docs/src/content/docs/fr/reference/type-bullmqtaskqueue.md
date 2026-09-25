---
title: "BullMQTaskQueue"
description: "BullMQTaskQueue — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { BullMQTaskQueue } from "@elie-laloum/outpost/queues/bullmq";
```

## Paramètres et propriétés

| Nom        | Type                                                            | Présence | Rôle                                                                                                                                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `close`    | `() => Promise<void>`                                           | Requis   | Refuse les nouvelles opérations, attend celles admises, arrête les contrôles de jobs bloqués et ferme les connexions Redis possédées, de façon idempotente. Arrêter et attendre runQueueWorker auparavant. Conserve jobs, générations et résultats ; les baux actifs restent récupérables. |
| `enqueue`  | `(request: QueueRequest) => Promise<QueueJob>`                  | Requis   | Persiste une demande de travail JSON, déduplique par identifiant et rejette les demandes contradictoires.                                                                                                                                                                                  |
| `get`      | `(id: string) => Promise<QueueJob \| undefined>`                | Requis   | Renvoie le travail persisté courant d’un identifiant, ou undefined s’il est absent.                                                                                                                                                                                                        |
| `claim`    | `(request: QueueClaim) => Promise<QueueJob \| undefined>`       | Requis   | Prend en charge un travail éligible pour un gestionnaire du worker avec un nouveau jeton de bail.                                                                                                                                                                                          |
| `renew`    | `(lease: QueueLease, leaseMs: number) => Promise<QueueJob>`     | Requis   | Prolonge le bail courant du worker ; rejette un worker ou jeton périmé.                                                                                                                                                                                                                    |
| `complete` | `(lease: QueueLease, result: QueueResult) => Promise<QueueJob>` | Requis   | Persiste le résultat seulement si le worker possède encore le bail et le jeton correspondants.                                                                                                                                                                                             |
| `cancel`   | `(id: string, fence: number) => Promise<QueueJob>`              | Requis   | Annule un travail seulement si son jeton courant correspond à la génération fournie.                                                                                                                                                                                                       |

## Signature

```ts
export interface BullMQTaskQueue extends TaskQueue {
  close(): Promise<void>;
}
```

## Contrats associés

- [TaskQueue](../taskqueue/)
