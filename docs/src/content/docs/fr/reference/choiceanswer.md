---
title: "ChoiceAnswer"
description: "ChoiceAnswer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ChoiceAnswer } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                               | Présence | Rôle                                                                                                                                                                                           |
| --------------- | ---------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | `"choice"`                         | Requis   | Discriminant de réponse choice.                                                                                                                                                                |
| `choice`        | `Choice`                           | Requis   | Option déclarée sélectionnée, inférée depuis les clés des critères de la question.                                                                                                             |
| `probabilities` | `Readonly<Record<Choice, number>>` | Requis   | Probabilité native de chaque option déclarée ; valeurs finies dans [0,1] dont la somme vaut un à l’erreur d’arrondi cumulée de quatre décimales près. Valeurs conservées sans renormalisation. |
| `confidence`    | `number`                           | Requis   | Confiance native dans [0,1], conservée sans recalcul depuis la distribution.                                                                                                                   |

## Signature

```ts
export interface ChoiceAnswer<Choice extends string = string> {
  readonly type: "choice";
  readonly choice: Choice;
  readonly probabilities: Readonly<Record<Choice, number>>;
  readonly confidence: number;
}
```
