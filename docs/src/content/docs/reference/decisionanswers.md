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

## Purpose and behavior

Readonly mapped answer object preserving every question key and its corresponding primitive-specific answer type.

[Complete example and detailed rules](../../guide/decisions/).

## Signature

```ts
export type DecisionAnswers<Q extends DecisionQuestions> = {
  readonly [Key in keyof Q]: DecisionAnswer<Q[Key]>;
};
```

## Related contracts

- [DecisionAnswer](../decisionanswer/)
- [DecisionQuestions](../decisionquestions/)
