---
title: "ScoreQuestion"
description: "ScoreQuestion — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ScoreQuestion } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                | Présence | Rôle                                                                                       |
| -------------- | ------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `type`         | `"score"`           | Requis   | Discriminant score : évaluer de 2 à 10 niveaux ordonnés indexés à partir de zéro.          |
| `instructions` | `string`            | Requis   | Instructions textuelles non vides pour cette question.                                     |
| `criteria`     | `readonly string[]` | Requis   | Descriptions non vides des niveaux, ordonnées de l’indice 0 au nombre de niveaux moins un. |

## Signature

```ts
export interface ScoreQuestion {
  readonly type: "score";
  readonly instructions: string;
  readonly criteria: readonly string[];
}
```
