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

## Purpose and behavior

Answer type selected by the question primitive; choice values are inferred from its declared criteria keys.

[Complete example and detailed rules](../../guide/decisions/).

## Signature

```ts
export type DecisionAnswer<Q extends DecisionQuestion> =
  Q extends ChoiceQuestion
    ? ChoiceAnswer<`${Extract<keyof Q["criteria"], string | number>}`>
    : Q extends ScoreQuestion
      ? ScoreAnswer
      : NoulAnswer;
```

## Related contracts

- [ChoiceAnswer](../choiceanswer/)
- [ChoiceQuestion](../choicequestion/)
- [DecisionQuestion](../decisionquestion/)
- [NoulAnswer](../noulanswer/)
- [ScoreAnswer](../scoreanswer/)
- [ScoreQuestion](../scorequestion/)
