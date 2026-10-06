---
title: "DecisionQuestion"
description: "DecisionQuestion — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DecisionQuestion } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom            | Type                                                                                                                       | Présence          | Rôle                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `type`         | `"choice" \| "score" \| "noul"`                                                                                            | Requis            | Primitive de question : choice, score ou noul.                                                                                      |
| `instructions` | `string`                                                                                                                   | Requis            | Instructions non vides pour la primitive de question sélectionnée.                                                                  |
| `criteria`     | `Readonly<Record<string, string>> \| readonly string[] \| { readonly true: string; readonly false: string; } \| undefined` | Selon la variante | Pour choice, descriptions nommées ; pour score, descriptions de niveaux ordonnés ; pour noul, descriptions true/false facultatives. |

## Signature

```ts
export type DecisionQuestion = ChoiceQuestion | ScoreQuestion | NoulQuestion;
```

## Contrats associés

- [ChoiceQuestion](../choicequestion/)
- [NoulQuestion](../noulquestion/)
- [ScoreQuestion](../scorequestion/)
