---
title: "QueueHandler"
description: "QueueHandler — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueHandler**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueHandler } from "@elie-laloum/outpost";
```

## Signature

```ts
export type QueueHandler = (
  input: WorkflowJson,
  context: QueueHandlerContext,
) => Promise<QueueResult> | QueueResult;
```

## Contrats associés

- [QueueHandlerContext](../queuehandlercontext/)
- [QueueResult](../queueresult/)
- [WorkflowJson](../workflowjson/)
