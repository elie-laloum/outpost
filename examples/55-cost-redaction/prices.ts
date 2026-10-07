import { loadModelPrices, type ModelPriceTable } from "@elie-laloum/outpost";

export const illustrativePrices: ModelPriceTable = {
  currency: "EUR",
  models: { demo: { input: 2, cached: 0.5, cacheCreated: 3, output: 8 } },
};

export async function pricesFromCatalog(): Promise<ModelPriceTable> {
  return loadModelPrices({
    provider: "openai",
    models: { demo: "gpt-5" },
    currency: "EUR",
    usdExchangeRate: Number(process.env.OUTPOST_USD_EUR_RATE),
  });
}
