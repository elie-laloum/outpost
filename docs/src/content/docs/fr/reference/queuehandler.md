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

| Nom       | Type                  | Présence | Rôle                                                                             |
| --------- | --------------------- | -------- | -------------------------------------------------------------------------------- |
| `input`   | `WorkflowJson`        | Requis   | Entrée JSON sans perte fournie au gestionnaire de travail enregistré.            |
| `context` | `QueueHandlerContext` | Requis   | Travail pris en charge et signal d’annulation fournis au gestionnaire du worker. |

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
