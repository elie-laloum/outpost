---
title: "TaskQueue"
description: "TaskQueue — Outpost API"
sidebar:
  order: 10
---

Contrat public de **TaskQueue**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { TaskQueue } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom        | Type                                                            | Présence | Rôle                                                                             |
| ---------- | --------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `enqueue`  | `(request: QueueRequest) => Promise<QueueJob>`                  | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `get`      | `(id: string) => Promise<QueueJob \| undefined>`                | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `claim`    | `(request: QueueClaim) => Promise<QueueJob \| undefined>`       | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `renew`    | `(lease: QueueLease, leaseMs: number) => Promise<QueueJob>`     | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `complete` | `(lease: QueueLease, result: QueueResult) => Promise<QueueJob>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `cancel`   | `(id: string, fence: number) => Promise<QueueJob>`              | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
