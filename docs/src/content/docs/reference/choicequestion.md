---
title: "ChoiceQuestion"
description: "ChoiceQuestion — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ChoiceQuestion } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                               | Presence | Meaning                                                                            |
| -------------- | ---------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `type`         | `"choice"`                         | Required | choice discriminator. Choose one of 2 to 255 named options.                        |
| `instructions` | `string`                           | Required | Nonempty natural-language instructions for this question.                          |
| `criteria`     | `Readonly<Record<string, string>>` | Required | Named options with nonempty descriptions; keys become the allowed choice literals. |

## Signature

```ts
export interface ChoiceQuestion {
  readonly type: "choice";
  readonly instructions: string;
  readonly criteria: Readonly<Record<string, string>>;
}
```
