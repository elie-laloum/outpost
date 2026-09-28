---
title: "QueueQuota"
description: "QueueQuota — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueQuota } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                                                                                                         |
| -------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `resetAt`      | `string \| undefined` | Optionnel | Heure ISO de réinitialisation de la limite, lorsque l’erreur du handler l’indiquait.                                                                         |
| `conversation` | `string \| undefined` | Optionnel | Conversation capturée de l’exécution interrompue du handler ; le workflow la restitue via TaskContext.quota pour que l’entrée suivante puisse la poursuivre. |

## Signature

```ts
export interface QueueQuota {
  readonly resetAt?: string;
  /** Captured conversation the handler can continue after the pause. */
  readonly conversation?: string;
}
```
