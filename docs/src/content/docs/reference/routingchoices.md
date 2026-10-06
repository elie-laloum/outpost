---
title: "RoutingChoices"
description: "RoutingChoices — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { RoutingChoices } from "@elie-laloum/outpost";
```

## Purpose and behavior

String literals of the selected choice question criteria, used as candidate and fallback keys.

[Complete example and detailed rules](../../guide/decisions/).

## Signature

```ts
export type RoutingChoices<
  Q extends DecisionQuestions,
  Key extends RoutingQuestion<Q>,
> = `${Extract<keyof Extract<Q[Key], ChoiceQuestion>["criteria"], string | number>}`;
```

## Related contracts

- [ChoiceQuestion](../choicequestion/)
- [DecisionQuestions](../decisionquestions/)
- [RoutingQuestion](../routingquestion/)
