---
title: "ModelPrice"
description: "ModelPrice — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelPrice } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                            |
| -------------- | --------------------- | -------- | ---------------------------------------------------------------------------------- |
| `input`        | `number`              | Required | Amount per million uncached input tokens in the price table’s currency.            |
| `output`       | `number`              | Required | Amount per million generated output tokens, including reasoning counted in output. |
| `cached`       | `number \| undefined` | Optional | Amount per million cache-read tokens; defaults to input when omitted.              |
| `cacheCreated` | `number \| undefined` | Optional | Amount per million cache-write tokens; defaults to input when omitted.             |

## Signature

```ts
export interface ModelPrice {
  readonly input: number;
  readonly output: number;
  readonly cached?: number;
  readonly cacheCreated?: number;
}
```
