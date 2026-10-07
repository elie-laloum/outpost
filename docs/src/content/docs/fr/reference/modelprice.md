---
title: "ModelPrice"
description: "ModelPrice — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelPrice } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                                                  |
| -------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `input`        | `number`              | Requis    | Montant par million de tokens d’entrée hors cache dans la devise de la table.                         |
| `output`       | `number`              | Requis    | Montant par million de tokens de sortie générés, raisonnement compris lorsqu’il est compté en sortie. |
| `cached`       | `number \| undefined` | Optionnel | Montant par million de tokens lus dans le cache ; utilise input si omis.                              |
| `cacheCreated` | `number \| undefined` | Optionnel | Montant par million de tokens écrits dans le cache ; utilise input si omis.                           |

## Signature

```ts
export interface ModelPrice {
  readonly input: number;
  readonly output: number;
  readonly cached?: number;
  readonly cacheCreated?: number;
}
```
