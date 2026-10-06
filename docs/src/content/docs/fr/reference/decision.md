---
title: "Decision"
description: "Decision — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Decision } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type         | Présence | Rôle                                                                                                        |
| ----------- | ------------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| `kind`      | `"decision"` | Requis   | Discriminant de déclaration figée ; les évaluations exigent une déclaration construite avec defineDecision. |
| `questions` | `Q`          | Requis   | Copie validée et immuable des déclarations de questions nommées.                                            |

## Signature

```ts
export interface Decision<Q extends DecisionQuestions = DecisionQuestions> {
  readonly kind: "decision";
  readonly questions: Q;
}
```

## Contrats associés

- [DecisionQuestions](../decisionquestions/)
