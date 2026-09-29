---
title: "TaskQueue"
description: "TaskQueue — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskQueue } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                            | Présence | Rôle                                                                                                                                                                                                  |
| ---------- | --------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enqueue`  | `(request: QueueRequest) => Promise<QueueJob>`                  | Requis   | Enregistre un job pending, ou renvoie le job stocké, quel que soit son statut, quand l’identifiant porte déjà une requête identique. Une requête différente sous un identifiant existant est refusée. |
| `get`      | `(id: string) => Promise<QueueJob \| undefined>`                | Requis   | Renvoie le job d’un identifiant, ou undefined s’il est absent ; un job dont la deadline est dépassée revient cancelled.                                                                               |
| `claim`    | `(request: QueueClaim) => Promise<QueueJob \| undefined>`       | Requis   | Prend un job pending, ou un job active dont le bail a expiré, pour l’un des handlers listés ; incrémente son fence et ouvre un bail. Renvoie undefined quand aucun job n’est éligible.                |
| `renew`    | `(lease: QueueLease, leaseMs: number) => Promise<QueueJob>`     | Requis   | Prolonge le bail de leaseMs, sans dépasser la deadline du job. Rejette avec Stale queue lease quand le worker, le fence ou l’expiration du bail ne correspondent plus.                                |
| `complete` | `(lease: QueueLease, result: QueueResult) => Promise<QueueJob>` | Requis   | Enregistre le résultat et marque le job done, ou failed quand result.error est renseigné. Rejette avec Stale queue lease si le bail n’est plus courant.                                               |
| `cancel`   | `(id: string, fence: number) => Promise<QueueJob>`              | Requis   | Annule un job pending ou active et incrémente son fence ; un job terminé est renvoyé inchangé. Rejette avec Stale queue fence quand fence diffère du fence courant du job.                            |

## Signature

```ts
export interface TaskQueue {
  enqueue(request: QueueRequest): Promise<QueueJob>;
  get(id: string): Promise<QueueJob | undefined>;
  claim(request: QueueClaim): Promise<QueueJob | undefined>;
  renew(lease: QueueLease, leaseMs: number): Promise<QueueJob>;
  complete(lease: QueueLease, result: QueueResult): Promise<QueueJob>;
  cancel(id: string, fence: number): Promise<QueueJob>;
}
```

## Contrats associés

- [QueueClaim](../queueclaim/)
- [QueueJob](../queuejob/)
- [QueueLease](../queuelease/)
- [QueueRequest](../queuerequest/)
- [QueueResult](../queueresult/)
