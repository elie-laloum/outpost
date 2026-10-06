---
title: "NoulQuestion"
description: "NoulQuestion — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { NoulQuestion } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                                              | Presence | Meaning                                                         |
| -------------- | ----------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `type`         | `"noul"`                                                          | Required | noul discriminator. Return a probability for the yes outcome.   |
| `instructions` | `string`                                                          | Required | Nonempty natural-language instructions for this question.       |
| `criteria`     | `{ readonly true: string; readonly false: string; } \| undefined` | Optional | Optional nonempty descriptions of both true and false outcomes. |

## Signature

```ts
export interface NoulQuestion {
  readonly type: "noul";
  readonly instructions: string;
  readonly criteria?: {
    readonly true: string;
    readonly false: string;
  };
}
```
