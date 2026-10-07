---
title: "loadModelPrices"
description: "loadModelPrices — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { loadModelPrices } from "@elie-laloum/outpost";
```

## Purpose and behavior

Fetch a bounded, cancellable models.dev or OpenRouter catalog once and return a frozen price table for the explicitly selected model aliases. Catalog prices are USD; EUR requires a caller-supplied exchange rate. Normalize OpenRouter per-token rates to per-million rates. Refuse missing models, invalid prices and unsupported tier or extra charges; no refresh or network access occurs during workflow accounting.

[Complete example and detailed rules](../../guide/budgets/).

## Parameters and properties

| Name                       | Type                                        | Presence | Meaning                                                                                                                  |
| -------------------------- | ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `options`                  | `ModelPricesOptions`                        | Required | Catalog selection, model aliases, currency conversion and bounded HTTP request settings.                                 |
| `options.source`           | `"models.dev" \| "openrouter" \| undefined` | Optional | Public catalog to load: models.dev (default) or openrouter.                                                              |
| `options.provider`         | `string \| undefined`                       | Optional | Required models.dev provider ID; ignored for OpenRouter.                                                                 |
| `options.models`           | `Readonly<Record<string, string>>`          | Required | Outpost model names mapped to exact IDs in the selected catalog; loads only these prices.                                |
| `options.currency`         | `"EUR" \| "USD" \| undefined`               | Optional | Output currency, USD by default; EUR requires usdExchangeRate.                                                           |
| `options.usdExchangeRate`  | `number \| undefined`                       | Optional | Caller-supplied amount of EUR for one USD when currency is EUR. USD accepts only 1.                                      |
| `options.url`              | `string \| undefined`                       | Optional | Optional absolute HTTP(S) catalog endpoint, without embedded credentials or fragment. Defaults to the public source URL. |
| `options.signal`           | `AbortSignal \| undefined`                  | Optional | Cancels the catalog request and body reading.                                                                            |
| `options.timeoutMs`        | `number \| undefined`                       | Optional | Total catalog request deadline, 15000 ms by default.                                                                     |
| `options.maxResponseBytes` | `number \| undefined`                       | Optional | Maximum catalog response bytes, 32 MiB by default.                                                                       |

## Returns

`Promise<ModelPriceTable>`

## Signature

```ts
export declare function loadModelPrices(
  options: ModelPricesOptions,
): Promise<ModelPriceTable>;
```

## Related contracts

- [ModelPricesOptions](../modelpricesoptions/)
- [ModelPriceTable](../modelpricetable/)
