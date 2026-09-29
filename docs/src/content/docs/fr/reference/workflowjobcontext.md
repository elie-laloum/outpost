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
| `signal`         | `AbortSignal` | Requis   | S’interrompt quand le worker s’arrête ou qu’un renouvellement de bail échoue, par exemple après une annulation, une deadline dépassée ou un bail perdu. Transmettez-le à chaque opération lancée par le handler.              |
| `job`            | `QueueJob`    | Requis   | Job tel que pris en charge, avec sa requête et son fence courant.                                                                                                                                                             |

## Signature

```ts
export interface WorkflowJobContext extends QueueHandlerContext {
  readonly runId: string;
}
```

## Contrats associés

- [QueueHandlerContext](../queuehandlercontext/)
