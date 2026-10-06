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

## Purpose and behavior

Keys of decision questions whose primitive is choice; score and noul questions cannot drive model routing.

[Complete example and detailed rules](../../guide/decisions/).

## Signature

```ts
export type RoutingQuestion<Q extends DecisionQuestions> = {
  [Key in keyof Q]: Extract<Q[Key], ChoiceQuestion> extends never ? never : Key;
}[keyof Q];
```

## Related contracts

- [ChoiceQuestion](../choicequestion/)
- [DecisionQuestions](../decisionquestions/)
