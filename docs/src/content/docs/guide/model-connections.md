---
title: "Model connections"
description: "Choose an HTTP protocol for the built-in loop."
---

The `ModelProvider` contract and `openaiModelProvider()` are stabilized for the next release. `anthropicModelProvider()` remains experimental pending authenticated delegation validation. Model requests run in the Outpost process.

Choose a model provider by protocol, then pass it to `harness({ modelProvider })`. Credentials are explicit and remain with the host-side client.

```ts
import {
  anthropicModelProvider,
  openaiModelProvider,
} from "@elie-laloum/outpost";

const messages = anthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
const compatible = openaiModelProvider({
  baseUrl: "http://127.0.0.1:8080/v1",
  api: "chat-completions",
  apiKey: false,
});
```

## Protocol selection

`openaiModelProvider()` accepts `chat-completions` (default) or `responses`. It appends the selected endpoint to `baseUrl`; no fallback changes protocols after an error. `anthropicModelProvider()` uses the Messages API.

This is separate from `codexHarness({ modelProvider })`, which configures Codex CLI and requires Responses compatibility.

## Bounds and streaming

`timeoutMs` defaults to 120,000 ms. For streaming it bounds silence between chunks. `maxResponseBytes` defaults to 8 MiB after decompression. Oversized or malformed responses fail at the protocol boundary.

Models are names or objects with supported reasoning and output limits. A service can reject a name even when the local contract accepts its shape. Replayable reasoning and tool-call messages remain protocol data managed by the provider.

The harness’s `cache` requests prefix caching. Anthropic’s `cacheSystem` explicitly adds a system cache breakpoint; cache hits are not guaranteed.

API: [openaiModelProvider](../../reference/openaimodelprovider/) · [anthropicModelProvider](../../reference/anthropicmodelprovider/) · [ModelProvider](../../reference/modelprovider/).

## Validation

Local September 2026 validation covers OpenAI Responses and Chat Completions with `gpt-5.6-luna`, delegation and editing in Docker, then cache, limits, cancellation and incomplete streams. Responses uses `low` reasoning; Chat Completions uses `none`, because the service rejected tools with `low`. Anthropic remains experimental after HTTP 401 authentication rejection; its previous campaign without delegation used `claude-haiku-4-5-20251001`.

In the source repository, `node scripts/harness-live.mjs offline docker coding` runs a deterministic fixture inside a real container. Replace `docker` with `podman`, `vercel` or `daytona` with their corresponding prerequisites. For a paid campaign, load your credentials and run `node scripts/harness-live.mjs responses docker coding --live`. The `chat-completions` and `anthropic` protocols accept the same scenarios: `coding`, `cache`, `cancel`, `truncation`, `steps`, `usage`, `network`.

Reports and the budget ledger go to `temp/harness-stable-live`, or `OUTPOST_HARNESS_REPORT_DIRECTORY`. The shared reservation ceiling is $5; each request reserves a conservative estimate before sending. Interrupted calls retain their reservation and estimates do not replace provider billing. Keep this directory on persistent storage and do not reset its budget to bypass the ceiling. Sandbox costs are separate. This synthetic campaign is not a benchmark against CLI agents.
