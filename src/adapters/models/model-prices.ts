import { invariant, positive } from "../../domain/errors.ts";
import { validatePrices } from "../../domain/pricing.ts";
import type {
  ModelPrice,
  ModelPriceTable,
} from "../../domain/pricing.types.ts";
import type { ModelPricesOptions } from "./model-prices.types.ts";
import {
  modelPriceEndpoints,
  modelPriceDefaults,
} from "./model-prices.constants.ts";
import { modelJson } from "./model-http.ts";

function object(value: unknown): Record<string, unknown> {
  invariant(
    value && typeof value === "object" && !Array.isArray(value),
    "Invalid model pricing catalog",
  );
  return value as Record<string, unknown>;
}
function rate(value: unknown, multiplier: number): number {
  const parsed =
    typeof value === "string" && value.trim() ? Number(value) : value;
  invariant(
    typeof parsed === "number" && Number.isFinite(parsed) && parsed >= 0,
    "Catalog price must be finite and nonnegative",
  );
  return parsed * multiplier;
}
function modelsDev(
  data: unknown,
  id: string,
  options: ModelPricesOptions,
): ModelPrice {
  invariant(
    typeof options.provider === "string" && options.provider.trim(),
    "models.dev requires an explicit provider",
  );
  const model = object(object(object(data)[options.provider]).models)[id];
  const cost = object(object(model).cost);
  invariant(
    Object.keys(cost).every((key) =>
      ["input", "output", "cache_read", "cache_write", "reasoning"].includes(
        key,
      ),
    ),
    "Catalog model uses unsupported tiered or modality prices; supply an explicit price table",
  );
  return {
    input: rate(cost.input, 1),
    output: rate(cost.output, 1),
    ...(cost.cache_read === undefined
      ? {}
      : { cached: rate(cost.cache_read, 1) }),
    ...(cost.cache_write === undefined
      ? {}
      : { cacheCreated: rate(cost.cache_write, 1) }),
  };
}
function openRouter(data: unknown, id: string): ModelPrice {
  const models = object(data).data;
  invariant(Array.isArray(models), "Invalid OpenRouter model catalog");
  const model = models.find((value) => object(value).id === id);
  const cost = object(object(model).pricing);
  for (const [key, value] of Object.entries(cost))
    if (
      ![
        "prompt",
        "completion",
        "input_cache_read",
        "input_cache_write",
      ].includes(key)
    )
      invariant(
        rate(value, 1) === 0,
        "Catalog model has unsupported charges; supply an explicit price table",
      );
  return {
    input: rate(cost.prompt, 1_000_000),
    output: rate(cost.completion, 1_000_000),
    ...(cost.input_cache_read === undefined
      ? {}
      : { cached: rate(cost.input_cache_read, 1_000_000) }),
    ...(cost.input_cache_write === undefined
      ? {}
      : { cacheCreated: rate(cost.input_cache_write, 1_000_000) }),
  };
}
const readers = { "models.dev": modelsDev, openrouter: openRouter };

export async function loadModelPrices(
  options: ModelPricesOptions,
): Promise<ModelPriceTable> {
  const source = options.source ?? modelPriceDefaults.source;
  invariant(Object.hasOwn(readers, source), "Unsupported pricing source");
  invariant(
    options.models && Object.keys(options.models).length > 0,
    "Select at least one catalog model",
  );
  const currency = options.currency ?? modelPriceDefaults.currency;
  const exchange = options.usdExchangeRate ?? 1;
  invariant(
    Number.isFinite(exchange) &&
      exchange > 0 &&
      (currency !== "EUR" || options.usdExchangeRate !== undefined) &&
      (currency !== "USD" || exchange === 1),
    "EUR prices require an explicit positive USD exchange rate; USD uses 1",
  );
  const url = new URL(options.url ?? modelPriceEndpoints[source]);
  invariant(
    ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.hash,
    "Pricing URL must use HTTP(S) without credentials or fragment",
  );
  const timeout = positive(
    options.timeoutMs ?? modelPriceDefaults.timeoutMs,
    "Pricing timeoutMs",
  );
  invariant(
    timeout <= 2_147_483_647,
    "Pricing timeout exceeds the supported timer range",
  );
  const maxBytes = positive(
    options.maxResponseBytes ?? modelPriceDefaults.maxResponseBytes,
    "Pricing maxResponseBytes",
  );
  const deadline = AbortSignal.timeout(timeout);
  const signal = options.signal
    ? AbortSignal.any([options.signal, deadline])
    : deadline;
  signal.throwIfAborted();
  const response = await fetch(url, { signal, redirect: "error" });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(
      `Pricing catalog request failed with HTTP ${response.status}`,
    );
  }
  const data = await modelJson(response, maxBytes);
  const models = Object.fromEntries(
    Object.entries(options.models).map(([alias, id]) => {
      invariant(
        alias.trim() && typeof id === "string" && id.trim(),
        "Pricing model names must be nonempty",
      );
      const price = readers[source](data, id, options);
      return [
        alias,
        Object.freeze({
          input: price.input * exchange,
          output: price.output * exchange,
          ...(price.cached === undefined
            ? {}
            : { cached: price.cached * exchange }),
          ...(price.cacheCreated === undefined
            ? {}
            : { cacheCreated: price.cacheCreated * exchange }),
        }),
      ];
    }),
  );
  const table = { currency, models };
  validatePrices(table);
  return Object.freeze({ currency, models: Object.freeze(models) });
}
