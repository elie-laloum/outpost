---
title: "VariableQuestion"
description: "VariableQuestion — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { VariableQuestion } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                       | Presence | Meaning                                                                                        |
| -------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `key`    | `string`                   | Required | Name of the missing variable, as written between {{ }} in the brief file.                      |
| `signal` | `AbortSignal \| undefined` | Optional | Cancellation signal of the attach, when it has one; stop waiting for an answer once it aborts. |

## Returns

`Promise<string>`

## Signature

```ts
export type VariableQuestion = (
  key: string,
  signal?: AbortSignal,
) => Promise<string>;
```
