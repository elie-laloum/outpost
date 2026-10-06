---
title: "DecisionAnswer"
description: "DecisionAnswer — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DecisionAnswer } from "@elie-laloum/outpost";
```

## Rôle et comportement

Type de réponse sélectionné par la primitive de question ; les valeurs choice sont inférées depuis les clés des critères déclarés.

[Exemple complet et règles détaillées](../../guide/decisions/).

## Signature

```ts
export type DecisionAnswer<Q extends DecisionQuestion> =
  Q extends ChoiceQuestion
    ? ChoiceAnswer<`${Extract<keyof Q["criteria"], string | number>}`>
    : Q extends ScoreQuestion
      ? ScoreAnswer
      : NoulAnswer;
```

## Contrats associés

- [ChoiceAnswer](../choiceanswer/)
- [ChoiceQuestion](../choicequestion/)
- [DecisionQuestion](../decisionquestion/)
- [NoulAnswer](../noulanswer/)
- [ScoreAnswer](../scoreanswer/)
- [ScoreQuestion](../scorequestion/)
