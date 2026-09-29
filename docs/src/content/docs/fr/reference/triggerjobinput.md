---
title: "TriggerJobInput"
description: "TriggerJobInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerJobInput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type           | Présence | Rôle                                                               |
| ------- | -------------- | -------- | ------------------------------------------------------------------ |
| `runId` | `string`       | Requis   | Exécution de checkpoint portée par le job.                         |
| `input` | `WorkflowJson` | Requis   | Entrée JSON portée par le job, null lorsqu’aucune n’a été fournie. |

## Signature

```ts
export interface TriggerJobInput {
  readonly runId: string;
  readonly input: WorkflowJson;
}
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
