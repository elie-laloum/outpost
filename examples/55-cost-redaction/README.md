# Monetary budgets and secret masking

Build the root package with `bun run build`, then run `node examples/55-cost-redaction/index.ts` with Node.js 24+. This deterministic example uses a simulated model and an explicitly unisolated local sandbox; no account, API key or container is required.

Like the other examples, it prepares a sample Git repository through `demoRepository()` in `examples/.repos/55-cost-redaction` and reuses it on subsequent runs. It estimates €2.60 using illustrative per-million rates, and checks that observation receivers, the saved harness transcript and journal contain no dummy key. The original prompt reaches the model; returned values stay intact. Inspect the printed repository path to review the saved files.

Run `OUTPOST_COST_LIMIT=0.01 node examples/55-cost-redaction/index.ts` to stop at the first usage report. The estimate can exceed the limit because usage arrives after a request; provider billing limits remain necessary.

Optional live catalog loading: set `OUTPOST_PRICE_CATALOG=1 OUTPOST_USD_EUR_RATE=<your-rate>` to call Models.dev once before the workflow. `prices.ts` maps the demo model to the catalog’s `openai/gpt-5` entry. This still uses a simulated model, not a paid GPT request. The adapter rejects unsupported pricing dimensions rather than silently ignoring them. OpenRouter is also supported through `loadModelPrices({ source: "openrouter", models: { ... } })`.

Masking covers matching complete strings in observations and supported conversation captures. It does not join streamed fragments or rewrite native agent files, temporary staging, checkpoints, old archives or your own logs. Binary bundles are refused when filtering is enabled. A masked conversation can lose information needed by resume or signed reasoning replay.
