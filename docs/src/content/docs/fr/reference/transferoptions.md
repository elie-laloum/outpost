---
title: "TransferOptions"
description: "TransferOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **TransferOptions**. Consultez le [guide providers](../../guide/environment/providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { TransferOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom          | Type                       | Présence  | Rôle                                              |
| ------------ | -------------------------- | --------- | ------------------------------------------------- |
| `signal`     | `AbortSignal \| undefined` | Optionnel | Annulation coopérative de cette opération.        |
| `deadlineMs` | `number \| undefined`      | Optionnel | Échéance absolue de l’opération en millisecondes. |

## Signature

```ts
export interface TransferOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```
