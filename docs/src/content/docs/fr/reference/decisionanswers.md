---
title: "DecisionAnswers"
description: "DecisionAnswers — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DecisionAnswers } from "@elie-laloum/outpost";
```

## Rôle et comportement

Objet de réponses en lecture seule conservant chaque clé de question et son type de réponse propre à la primitive.

[Exemple complet et règles détaillées](../../guide/decisions/).

## Signature

```ts
export type DecisionAnswers<Q extends DecisionQuestions> = {
  readonly [Key in keyof Q]: DecisionAnswer<Q[Key]>;
};
```

## Contrats associés

- [DecisionAnswer](../decisionanswer/)
- [DecisionQuestions](../decisionquestions/)
