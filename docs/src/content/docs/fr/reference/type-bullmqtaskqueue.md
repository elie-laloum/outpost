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

| Nom        | Type                                                            | Présence | Rôle                                                                                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `close`    | `() => Promise<void>`                                           | Requis   | Refuse les nouvelles opérations, attend celles en cours, puis ferme les connexions Redis de la file ; un second appel renvoie la même promesse. Arrêtez et attendez runQueueWorker() avant ; jobs, fences et résultats restent dans Redis. |
| `enqueue`  | `(request: QueueRequest) => Promise<QueueJob>`                  | Requis   | Enregistre un job pending, ou renvoie le job stocké, quel que soit son statut, quand l’identifiant porte déjà une requête identique. Une requête différente sous un identifiant existant est refusée.                                      |
| `get`      | `(id: string) => Promise<QueueJob \| undefined>`                | Requis   | Renvoie le job d’un identifiant, ou undefined s’il est absent ; un job dont la deadline est dépassée revient cancelled.                                                                                                                    |
| `claim`    | `(request: QueueClaim) => Promise<QueueJob \| undefined>`       | Requis   | Prend un job pending, ou un job active dont le bail a expiré, pour l’un des handlers listés ; incrémente son fence et ouvre un bail. Renvoie undefined quand aucun job n’est éligible.                                                     |
| `renew`    | `(lease: QueueLease, leaseMs: number) => Promise<QueueJob>`     | Requis   | Prolonge le bail de leaseMs, sans dépasser la deadline du job. Rejette avec Stale queue lease quand le worker, le fence ou l’expiration du bail ne correspondent plus.                                                                     |
| `complete` | `(lease: QueueLease, result: QueueResult) => Promise<QueueJob>` | Requis   | Enregistre le résultat et marque le job done, ou failed quand result.error est renseigné. Rejette avec Stale queue lease si le bail n’est plus courant.                                                                                    |
| `cancel`   | `(id: string, fence: number) => Promise<QueueJob>`              | Requis   | Annule un job pending ou active et incrémente son fence ; un job terminé est renvoyé inchangé. Rejette avec Stale queue fence quand fence diffère du fence courant du job.                                                                 |

## Signature

```ts
export interface BullMQTaskQueue extends TaskQueue {
  close(): Promise<void>;
}
```

## Contrats associés

- [TaskQueue](../taskqueue/)
