---
title: "QueueHandler"
description: "QueueHandler — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { QueueHandler } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                  | Présence | Rôle                                                            |
| --------- | --------------------- | -------- | --------------------------------------------------------------- |
| `input`   | `WorkflowJson`        | Requis   | Entrée JSON issue de la requête du job.                         |
| `context` | `QueueHandlerContext` | Requis   | Clé d’idempotence, signal d’interruption et job pris en charge. |

## Retour

`QueueResult | Promise<QueueResult>`

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
