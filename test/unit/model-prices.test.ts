import assert from "node:assert/strict";
import { createServer } from "node:http";
import { test } from "node:test";
import { loadModelPrices } from "../../src/index.ts";

test("pricing catalogs normalize units, aliases and an explicit EUR exchange rate", async (t) => {
  let body: unknown = {
    openai: {
      models: {
        demo: {
          cost: { input: 2, output: 8, cache_read: 0.5, cache_write: 3 },
        },
      },
    },
  };
  let status = 200;
  const server = createServer((_, res) => {
    res.writeHead(status);
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise<void>((resolve) => server.close(() => resolve())));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}`;
  const options = { url, provider: "openai", models: { local: "demo" } };
  const table = await loadModelPrices({
    ...options,
    currency: "EUR",
    usdExchangeRate: 0.9,
  });
  assert.deepEqual(table.models.local, {
    input: 1.8,
    output: 7.2,
    cached: 0.45,
    cacheCreated: 2.7,
  });
  assert.ok(Object.isFrozen(table.models.local));
  await assert.rejects(
    loadModelPrices({ ...options, currency: "EUR" }),
    /exchange rate/,
  );
  await assert.rejects(
    loadModelPrices({ ...options, provider: "missing" }),
    /catalog/,
  );
  await assert.rejects(
    loadModelPrices({ ...options, maxResponseBytes: 1 }),
    /maxResponseBytes/,
  );
  await assert.rejects(
    loadModelPrices({ ...options, signal: AbortSignal.abort() }),
  );
  body = {
    openai: {
      models: {
        demo: {
          cost: { input: 2, output: 8, context_over_200k: { input: 4 } },
        },
      },
    },
  };
  await assert.rejects(loadModelPrices(options), /unsupported/);
  body = {
    data: [
      {
        id: "demo",
        pricing: {
          prompt: "0.000002",
          completion: "0.000008",
          input_cache_read: "0.0000005",
          input_cache_write: "0.000003",
          request: "0",
        },
      },
    ],
  };
  assert.deepEqual(
    (await loadModelPrices({ ...options, source: "openrouter" })).models.local,
    { input: 2, output: 8, cached: 0.5, cacheCreated: 3 },
  );
  body = {
    data: [{ id: "demo", pricing: { prompt: "bad", completion: "0" } }],
  };
  await assert.rejects(
    loadModelPrices({ ...options, source: "openrouter" }),
    /nonnegative/,
  );
  body = "invalid JSON";
  await assert.rejects(loadModelPrices(options), /JSON/);
  status = 503;
  await assert.rejects(loadModelPrices(options), /503/);
});
