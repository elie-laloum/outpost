import { pricingCurrencies } from "./pricing.constants.ts";
import type { Usage } from "./agent.types.ts";
import type { ModelPriceTable, UsageCost } from "./pricing.types.ts";
import { validateUsage } from "./usage.ts";

export function validatePrices(prices: ModelPriceTable): void {
  if (
    !pricingCurrencies.includes(prices.currency) ||
    !prices.models ||
    typeof prices.models !== "object"
  )
    throw new Error("Prices require EUR or USD and a model table");
  for (const [model, price] of Object.entries(prices.models)) {
    if (!model.trim() || !price || typeof price !== "object")
      throw new Error("Invalid model price");
    for (const rate of [
      price.input,
      price.output,
      price.cached ?? price.input,
      price.cacheCreated ?? price.input,
    ])
      if (typeof rate !== "number" || !Number.isFinite(rate) || rate < 0)
        throw new Error(
          "Model prices must be finite nonnegative amounts per million tokens",
        );
  }
}

export function calculateUsageCost(
  usage: Usage,
  prices: ModelPriceTable,
): UsageCost {
  validatePrices(prices);
  validateUsage(usage);
  let amount = 0;
  let complete = usage.complete !== false;
  let measured = 0;
  for (const [model, tokens] of Object.entries(usage.models ?? {})) {
    const count =
      tokens.input + tokens.output + tokens.cached + (tokens.cacheCreated ?? 0);
    measured += count;
    const price = Object.hasOwn(prices.models, model)
      ? prices.models[model]
      : undefined;
    if (!price) {
      if (count > 0) complete = false;
      continue;
    }
    complete &&= tokens.complete !== false;
    const created = tokens.cacheCreated ?? 0;
    if (
      tokens.inputIncludesCache !== false &&
      tokens.cached + created > tokens.input
    )
      throw new Error("Cached tokens must be included in priced input usage");
    amount +=
      ((tokens.inputIncludesCache === false
        ? tokens.input
        : tokens.input - tokens.cached - created) *
        price.input +
        tokens.cached * (price.cached ?? price.input) +
        created * (price.cacheCreated ?? price.input) +
        tokens.output * price.output) /
      1_000_000;
  }
  if (
    measured <
    usage.input + usage.output + usage.cached + (usage.cacheCreated ?? 0)
  )
    complete = false;
  if (!Number.isFinite(amount))
    throw new Error("Calculated cost exceeds the supported numeric range");
  return Object.freeze({ currency: prices.currency, amount, complete });
}
