---
title: "Model providers"
description: "Choose an HTTP protocol for the built-in loop."
---

The `ModelProvider` contract, `createOpenAIModelProvider()` and `createAnthropicModelProvider()` are stable in 7.0.0. Model requests run in the Outpost process.

Choose a model provider by protocol, then pass it to `createHarness({ modelProvider })`. Credentials are explicit and remain with the host-side client.

```ts
import {
  createAnthropicModelProvider,
  createOpenAIModelProvider,
} from "@elie-laloum/outpost";

const messages = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
const compatible = createOpenAIModelProvider({
  baseUrl: "http://127.0.0.1:8080/v1",
  api: "chat-completions",
  apiKey: false,
});
```

## Protocol selection

`createOpenAIModelProvider()` accepts `chat-completions` (default) or `responses`. It appends the selected endpoint to `baseUrl`; no fallback changes protocols after an error. `createAnthropicModelProvider()` uses the Messages API.

This is separate from `createCodexHarness({ modelProvider })`, which configures Codex CLI and requires Responses compatibility.

## Bounds and streaming

`timeoutMs` defaults to 120,000 ms. For streaming it bounds silence between chunks. `maxResponseBytes` defaults to 8 MiB after decompression. Oversized or malformed responses fail at the protocol boundary.

Models are names or objects with supported reasoning and output limits. A service can reject a name even when the local contract accepts its shape. Replayable reasoning and tool-call messages remain protocol data managed by the provider.

The harness’s `cache` requests prefix caching. Anthropic’s `cacheSystem` explicitly adds a system cache breakpoint; cache hits are not guaranteed.

API: [createOpenAIModelProvider](../../reference/createopenaimodelprovider/) · [createAnthropicModelProvider](../../reference/createanthropicmodelprovider/) · [ModelProvider](../../reference/modelprovider/).

## Validation

Local September 2026 validation covers OpenAI Responses and Chat Completions with `gpt-5.6-luna`, delegation and editing in Docker, then cache, limits, cancellation and incomplete streams. Responses uses `low` reasoning; Chat Completions uses `none`, because the service rejected tools with `low`. On September 28, seven authenticated Anthropic scenarios passed with `claude-haiku-4-5-20251001` and thinking disabled: child editing/tests/commit and parent continuation in Docker, a real cache hit, cancellation, output and step limits, token budgets and rejection of an artificially interrupted real stream. This clears the delegation validation requirement for the adapter; other models and reasoning configurations still need their own live evidence.

In the source repository, `node scripts/harness-live.mjs offline docker coding` runs a deterministic fixture inside a real container. Replace `docker` with `podman`, `vercel` or `daytona` with their corresponding prerequisites. For a paid campaign, load your credentials and run `node scripts/harness-live.mjs responses docker coding --live`. The `chat-completions` and `anthropic` protocols accept the same scenarios: `coding`, `cache`, `cancel`, `truncation`, `steps`, `usage`, `network`.

Reports and the budget ledger go to `temp/harness-stable-live`, or `OUTPOST_HARNESS_REPORT_DIRECTORY`. The shared reservation ceiling is $5; each request reserves a conservative estimate before sending. Interrupted calls retain their reservation and estimates do not replace provider billing. Keep this directory on persistent storage and do not reset its budget to bypass the ceiling. Sandbox costs are separate. This synthetic campaign is not a benchmark against CLI agents.
