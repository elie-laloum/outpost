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

| Nom              | Type          | Présence | Rôle                                                                                                                 |
| ---------------- | ------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `idempotencyKey` | `string`      | Requis   | Identifiant du job commun à tous ses baux et reprises ; à utiliser pour dédupliquer durablement les effets externes. |
| `signal`         | `AbortSignal` | Requis   | Annulation coopérative de cette opération.                                                                           |
| `job`            | `QueueJob`    | Requis   | Travail persisté pris en charge, comprenant son entrée et sa génération de bail.                                     |

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
