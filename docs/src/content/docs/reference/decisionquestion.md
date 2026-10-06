---
title: "DecisionQuestion"
description: "DecisionQuestion — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DecisionQuestion } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name           | Type                                                                                                                       | Presence          | Meaning                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `type`         | `"choice" \| "score" \| "noul"`                                                                                            | Required          | Question primitive: choice, score or noul.                                                                         |
| `instructions` | `string`                                                                                                                   | Required          | Nonempty instructions for the selected question primitive.                                                         |
| `criteria`     | `Readonly<Record<string, string>> \| readonly string[] \| { readonly true: string; readonly false: string; } \| undefined` | Variant-dependent | For choice, named descriptions; for score, ordered level descriptions; for noul, optional true/false descriptions. |

## Signature

```ts
export type DecisionQuestion = ChoiceQuestion | ScoreQuestion | NoulQuestion;
```

## Related contracts

- [ChoiceQuestion](../choicequestion/)
- [NoulQuestion](../noulquestion/)
- [ScoreQuestion](../scorequestion/)
