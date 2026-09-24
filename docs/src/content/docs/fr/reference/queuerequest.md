---
title: "QueueRequest"
description: "QueueRequest — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueRequest**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueRequest } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueRequest {
  readonly id: string;
  readonly handler: string;
  readonly input: WorkflowJson;
  readonly deadline?: number;
}
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
