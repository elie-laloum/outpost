---
title: "ResponseSpec"
description: "ResponseSpec — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResponseSpec } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                           | Presence | Meaning                                                                                                                                                                  |
| --------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tag`     | `string`                       | Required | Tag name without angle brackets. The brief must contain its opening tag, or the dispatch fails with code configuration before the sandbox starts.                        |
| `repairs` | `number`                       | Required | Correction turns allowed after an invalid answer, 0 unless the options set it. Each resumes the same conversation and asks only for the corrected tag.                   |
| `read`    | `(text: string) => Promise<T>` | Required | Extract the last complete &lt;tag>…&lt;/tag> pair from a text, trim it and parse it. Rejects with ResponseError when no complete pair exists or its content is rejected. |

## Signature

```ts
export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  read(text: string): Promise<T>;
}
```
