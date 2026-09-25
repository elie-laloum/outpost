---
title: "TransferOptions"
description: "TransferOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransferOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                       | Présence  | Rôle                                                                                       |
| ------------ | -------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| `signal`     | `AbortSignal \| undefined` | Optionnel | Annulation coopérative de cette opération.                                                 |
| `deadlineMs` | `number \| undefined`      | Optionnel | Durée maximale de l’opération en millisecondes avant arrêt de la commande ou du transfert. |

## Signature

```ts
export interface TransferOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```
