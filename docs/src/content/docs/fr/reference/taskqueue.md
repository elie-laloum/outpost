---
title: "TaskQueue"
description: "TaskQueue — Outpost API"
sidebar:
  order: 10
---

Contrat public de **TaskQueue**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { TaskQueue } from "@elie-laloum/outpost";
```

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
