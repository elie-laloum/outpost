---
title: "ModelPricesOptions"
description: "ModelPricesOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelPricesOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                                        | Presence | Meaning                                                                                                                  |
| ------------------ | ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `source`           | `"models.dev" \| "openrouter" \| undefined` | Optional | Public catalog to load: models.dev (default) or openrouter.                                                              |
| `provider`         | `string \| undefined`                       | Optional | Required models.dev provider ID; ignored for OpenRouter.                                                                 |
| `models`           | `Readonly<Record<string, string>>`          | Required | Outpost model names mapped to exact IDs in the selected catalog; loads only these prices.                                |
| `currency`         | `"EUR" \| "USD" \| undefined`               | Optional | Output currency, USD by default; EUR requires usdExchangeRate.                                                           |
| `usdExchangeRate`  | `number \| undefined`                       | Optional | Caller-supplied amount of EUR for one USD when currency is EUR. USD accepts only 1.                                      |
| `url`              | `string \| undefined`                       | Optional | Optional absolute HTTP(S) catalog endpoint, without embedded credentials or fragment. Defaults to the public source URL. |
| `signal`           | `AbortSignal \| undefined`                  | Optional | Cancels the catalog request and body reading.                                                                            |
| `timeoutMs`        | `number \| undefined`                       | Optional | Total catalog request deadline, 15000 ms by default.                                                                     |
| `maxResponseBytes` | `number \| undefined`                       | Optional | Maximum catalog response bytes, 32 MiB by default.                                                                       |

## Signature

```ts
export interface ModelPricesOptions {
  readonly source?: "models.dev" | "openrouter";
  readonly provider?: string;
  readonly models: Readonly<Record<string, string>>;
  readonly currency?: "EUR" | "USD";
  readonly usdExchangeRate?: number;
  readonly url?: string;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```
