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

| Name      | Type                           | Presence | Meaning                                                                                        |
| --------- | ------------------------------ | -------- | ---------------------------------------------------------------------------------------------- |
| `tag`     | `string`                       | Required | XML-style delimiter identifier.                                                                |
| `repairs` | `number`                       | Required | Additional attempts to repair invalid structured output; zero by default.                      |
| `read`    | `(text: string) => Promise<T>` | Required | Extract the last complete tagged answer and validate it, rejecting missing or invalid content. |

## Signature

```ts
export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  read(text: string): Promise<T>;
}
```
