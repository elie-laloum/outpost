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

## Parameters and properties

| Name            | Type                               | Presence | Meaning                                                                                                                                                                      |
| --------------- | ---------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | `"choice"`                         | Required | Answer discriminator choice.                                                                                                                                                 |
| `choice`        | `Choice`                           | Required | Selected declared option, inferred from the question criteria keys.                                                                                                          |
| `probabilities` | `Readonly<Record<Choice, number>>` | Required | Native probability for every declared option; finite values in [0,1] sum to one within accumulated four-decimal rounding error. Values are retained without renormalization. |
| `confidence`    | `number`                           | Required | Native confidence in [0,1], retained without recomputing it from the distribution.                                                                                           |

## Signature

```ts
export interface ChoiceAnswer<Choice extends string = string> {
  readonly type: "choice";
  readonly choice: Choice;
  readonly probabilities: Readonly<Record<Choice, number>>;
  readonly confidence: number;
}
```
