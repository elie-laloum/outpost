---
title: "QueueHandlerContext"
description: "QueueHandlerContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueHandlerContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type          | Présence | Rôle                                                                                                                                                                                                                          |
| ---------------- | ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `idempotencyKey` | `string`      | Requis   | Clé d’effet stable de ce job logique : l’idempotencyKey de la requête si elle est définie, sinon l’identifiant du job partagé par chaque bail et reprise. Utilisez-la pour une déduplication persistante des effets externes. |
| `signal`         | `AbortSignal` | Requis   | Annulation coopérative de cette opération.                                                                                                                                                                                    |
| `job`            | `QueueJob`    | Requis   | Travail persisté pris en charge, comprenant son entrée et sa génération de bail.                                                                                                                                              |

## Signature

```ts
export interface QueueHandlerContext {
  readonly idempotencyKey: string;
  readonly signal: AbortSignal;
  readonly job: QueueJob;
}
```

## Contrats associés

- [QueueJob](../queuejob/)
