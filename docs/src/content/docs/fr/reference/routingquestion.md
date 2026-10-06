---
title: "RoutingQuestion"
description: "RoutingQuestion — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { RoutingQuestion } from "@elie-laloum/outpost";
```

## Rôle et comportement

Clés des questions de décision dont la primitive est choice ; les questions score et noul ne peuvent pas router les modèles.

[Exemple complet et règles détaillées](../../guide/decisions/).

## Signature

```ts
export type RoutingQuestion<Q extends DecisionQuestions> = {
  [Key in keyof Q]: Extract<Q[Key], ChoiceQuestion> extends never ? never : Key;
}[keyof Q];
```

## Contrats associés

- [ChoiceQuestion](../choicequestion/)
- [DecisionQuestions](../decisionquestions/)
