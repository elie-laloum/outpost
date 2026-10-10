---
title: "Estimate and limit spending"
description: "Estimate token spending without making a model request."
---

Estimate token spending without making a model request. Save these files together and run `node monetary-budget.ts`. The rates below are illustrative, not current vendor prices.

## Set prices and a limit

Rates are per million tokens in one currency. Model names must match your agent configuration exactly.

```ts title="prices.ts"
import type { ModelPriceTable } from "@elie-laloum/outpost";
export const prices: ModelPriceTable = {
  currency: "EUR",
  models: {
    "my-model": { input: 2, cached: 0.5, cacheCreated: 3, output: 8 },
  },
};
```

This task reports usage explicitly. Agent task helpers already do so; a custom dispatch needs `prices: context.prices`, and a queue worker must return usage attributed to each model.

```ts title="monetary-budget.ts"
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
import { prices } from "./prices.ts";
const task = defineTask({
  key: "meter",
  perform(context) {
    const tokens = { input: 100_000, cached: 0, output: 50_000 };
    context.reportUsage({ ...tokens, models: { "my-model": tokens } });
    return "recorded";
  },
});
export const result = await defineWorkflow("cost", [task]).start({
  budget: { prices, cost: { currency: "EUR", limit: 20 } },
});
console.log(result.usage.cost);
```

<!-- check:run -->

The result estimates **€0.60**: €0.20 for input and €0.40 for output. The €20 limit covers all tasks and retries. To estimate without stopping execution, supply `prices` without `cost`.

## Handle an incomplete estimate

A strict cost budget stops with `WorkflowCostUnavailable` if usage, a model or a price is missing—even with an attempt limit. Reaching the cost limit cancels active attempts with `WorkflowBudgetExceeded`.

:::caution
Requests already in flight can overshoot. Keep provider spending limits: this is a token-price estimate, including for subscription accounts, not an invoice or billing cap.
:::

## Load a public pricing catalog

To use Models.dev prices, map your model alias to its catalog ID. This EUR exchange rate is illustrative.

```ts title="catalog-prices.ts"
import { loadModelPrices } from "@elie-laloum/outpost";

export const prices = await loadModelPrices({
  provider: "openai",
  models: { "my-model": "gpt-5" },
  currency: "EUR",
  usdExchangeRate: 0.9,
});
```

In `monetary-budget.ts`, import `prices` from `./catalog-prices.ts`. Check the loaded rates; they do not refresh automatically. See [loadModelPrices](../../reference/loadmodelprices/) for OpenRouter, conversion and loading errors.

## Keep estimates stable on resume

Save and reuse the price table: a resumed workflow recomputes total cost from saved model counters. Old checkpoints without those counters cannot satisfy a strict cost budget. A durable candidate race requires its original price table.

API : [ModelPriceTable](../../reference/modelpricetable/) · [UsageCost](../../reference/usagecost/) · [WorkflowBudget](../../reference/workflowbudget/).
