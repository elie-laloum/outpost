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

## Parameters and properties

| Name        | Type         | Presence | Meaning                                                                                        |
| ----------- | ------------ | -------- | ---------------------------------------------------------------------------------------------- |
| `kind`      | `"decision"` | Required | Frozen declaration discriminator; evaluations require a declaration built with defineDecision. |
| `questions` | `Q`          | Required | Validated, immutable snapshot of the named question declarations.                              |

## Signature

```ts
export interface Decision<Q extends DecisionQuestions = DecisionQuestions> {
  readonly kind: "decision";
  readonly questions: Q;
}
```

## Related contracts

- [DecisionQuestions](../decisionquestions/)
