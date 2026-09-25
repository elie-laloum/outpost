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

| Name     | Type                       | Presence | Meaning                                                      |
| -------- | -------------------------- | -------- | ------------------------------------------------------------ |
| `key`    | `string`                   | Required | Name of the missing brief variable whose value is requested. |
| `signal` | `AbortSignal \| undefined` | Optional | Cooperative cancellation for this operation.                 |

## Returns

`Promise<string>`

## Signature

```ts
export type VariableQuestion = (
  key: string,
  signal?: AbortSignal,
) => Promise<string>;
```
