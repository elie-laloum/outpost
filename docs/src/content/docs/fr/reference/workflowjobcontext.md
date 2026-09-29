---
title: "WorkflowJobContext"
description: "WorkflowJobContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowJobContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type          | Présence | Rôle                                                                                                                                                                                                                          |
| ---------------- | ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runId`          | `string`      | Requis   | Exécution de checkpoint portée par le job.                                                                                                                                                                                    |
| `idempotencyKey` | `string`      | Requis   | Clé d’effet stable de ce job logique : l’idempotencyKey de la requête si elle est définie, sinon l’identifiant du job partagé par chaque bail et reprise. Utilisez-la pour une déduplication persistante des effets externes. |
| `signal`         | `AbortSignal` | Requis   | Annulation coopérative de cette opération.                                                                                                                                                                                    |
| `job`            | `QueueJob`    | Requis   | Travail persisté pris en charge, comprenant son entrée et sa génération de bail.                                                                                                                                              |

## Signature

```ts
export interface WorkflowJobContext extends QueueHandlerContext {
  readonly runId: string;
}
```

## Contrats associés

- [QueueHandlerContext](../queuehandlercontext/)
