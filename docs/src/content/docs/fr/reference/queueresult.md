---
title: "QueueResult"
description: "QueueResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueResult**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueResult {
  readonly value: WorkflowJson;
  readonly usage?: Usage;
  readonly error?: string;
}
```

## Contrats associés

- [Usage](../usage/)
- [WorkflowJson](../workflowjson/)
