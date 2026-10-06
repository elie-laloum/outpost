---
title: "ScoreQuestion"
description: "ScoreQuestion — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ScoreQuestion } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                | Presence | Meaning                                                                              |
| -------------- | ------------------- | -------- | ------------------------------------------------------------------------------------ |
| `type`         | `"score"`           | Required | Score discriminator: evaluate 2 to 10 ordered levels indexed from zero.              |
| `instructions` | `string`            | Required | Nonempty natural-language instructions for this question.                            |
| `criteria`     | `readonly string[]` | Required | Nonempty level descriptions, ordered from index 0 to the number of levels minus one. |

## Signature

```ts
export interface ScoreQuestion {
  readonly type: "score";
  readonly instructions: string;
  readonly criteria: readonly string[];
}
```
