---
title: "StageLimits"
description: "StageLimits — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StageLimits } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                             |
| ----------- | --------------------- | --------- | ---------------------------------------------------------------- |
| `copyMs`    | `number \| undefined` | Optionnel | Délai de copie des entrées du workspace, en millisecondes.       |
| `gitMs`     | `number \| undefined` | Optionnel | Délai des commandes de préparation Git, en millisecondes.        |
| `collectMs` | `number \| undefined` | Optionnel | Délai de collecte des commits après exécution, en millisecondes. |
| `mergeMs`   | `number \| undefined` | Optionnel | Délai d’intégration de la branche de travail, en millisecondes.  |

## Signature

```ts
export interface StageLimits {
  readonly copyMs?: number;
  readonly gitMs?: number;
  readonly collectMs?: number;
  readonly mergeMs?: number;
}
```
