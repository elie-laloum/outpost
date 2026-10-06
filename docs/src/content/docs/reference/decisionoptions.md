---
title: "DecisionOptions"
description: "DecisionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type | Presence | Meaning                                                                             |
| ----------- | ---- | -------- | ----------------------------------------------------------------------------------- |
| `questions` | `Q`  | Required | Nonempty named questions whose keys and choice literals determine the answer types. |

## Signature

```ts
export interface DecisionOptions<
  Q extends DecisionQuestions = DecisionQuestions,
> {
  readonly questions: Q;
}
```

## Related contracts

- [DecisionQuestions](../decisionquestions/)
