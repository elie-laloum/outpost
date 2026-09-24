---
title: "QueueJob"
description: "QueueJob — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueJob**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueJob } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueJob extends QueueRequest {
  readonly status: "pending" | "active" | "done" | "failed" | "cancelled";
  readonly fence: number;
  readonly worker?: string;
  readonly expires?: number;
  readonly result?: QueueResult;
}
```

## Contrats associés

- [QueueRequest](../queuerequest/)
- [QueueResult](../queueresult/)
