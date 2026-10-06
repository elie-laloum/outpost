---
title: "ScoreAnswer"
description: "ScoreAnswer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ScoreAnswer } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                            | Présence  | Rôle                                                                                                                                                                                                                  |
| --------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | `"score"`                                       | Requis    | Discriminant de réponse score.                                                                                                                                                                                        |
| `score`         | `number`                                        | Requis    | Indice de niveau natif pondéré par les probabilités, entre zéro et le nombre de niveaux moins un ; la cohérence accepte l’arrondi cumulé à quatre décimales du score et des probabilités.                             |
| `probabilities` | `Readonly<Record<string, number>>`              | Requis    | Distribution native indexée par les indices des niveaux ; les niveaux de probabilité nulle peuvent être omis et l’erreur d’arrondi cumulée de quatre décimales est acceptée. Valeurs conservées sans renormalisation. |
| `confidence`    | `number`                                        | Requis    | Confiance native dans [0,1], conservée sans recalcul depuis la distribution.                                                                                                                                          |
| `legend`        | `Readonly<Record<string, string>> \| undefined` | Optionnel | Mapping natif facultatif de toutes les positions de niveaux vers leurs descriptions textuelles.                                                                                                                       |

## Signature

```ts
export interface ScoreAnswer {
  readonly type: "score";
  readonly score: number;
  readonly probabilities: Readonly<Record<string, number>>;
  readonly confidence: number;
  readonly legend?: Readonly<Record<string, string>>;
}
```
