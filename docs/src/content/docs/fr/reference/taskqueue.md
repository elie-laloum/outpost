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

| Nom        | Type                                                            | Présence | Rôle                                                                                                      |
| ---------- | --------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `enqueue`  | `(request: QueueRequest) => Promise<QueueJob>`                  | Requis   | Persiste une demande de travail JSON, déduplique par identifiant et rejette les demandes contradictoires. |
| `get`      | `(id: string) => Promise<QueueJob \| undefined>`                | Requis   | Renvoie le travail persisté courant d’un identifiant, ou undefined s’il est absent.                       |
| `claim`    | `(request: QueueClaim) => Promise<QueueJob \| undefined>`       | Requis   | Prend en charge un travail éligible pour un gestionnaire du worker avec un nouveau jeton de bail.         |
| `renew`    | `(lease: QueueLease, leaseMs: number) => Promise<QueueJob>`     | Requis   | Prolonge le bail courant du worker ; rejette un worker ou jeton périmé.                                   |
| `complete` | `(lease: QueueLease, result: QueueResult) => Promise<QueueJob>` | Requis   | Persiste le résultat seulement si le worker possède encore le bail et le jeton correspondants.            |
| `cancel`   | `(id: string, fence: number) => Promise<QueueJob>`              | Requis   | Annule un travail seulement si son jeton courant correspond à la génération fournie.                      |

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
