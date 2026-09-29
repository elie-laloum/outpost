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

| Nom          | Type                       | Présence  | Rôle                                                                                                                                                                                                  |
| ------------ | -------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signal`     | `AbortSignal \| undefined` | Optionnel | Annulation coopérative de cette opération.                                                                                                                                                            |
| `deadlineMs` | `number \| undefined`      | Optionnel | Durée maximale en millisecondes ; au-delà, le transfert s’arrête avec le code timeout. Outpost applique 120000 aux transferts de fichiers de la sandbox, sauf si limits.copyMs fixe une autre valeur. |

## Signature

```ts
export interface TransferOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```
