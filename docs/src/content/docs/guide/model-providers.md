---
title: "Connect a model API"
description: "Configure an OpenAI or Anthropic model provider for the built-in harness."
---

## Connect a model

Connect a model provider to `createHarness()` so the built-in loop can call the model API. Then compose the harness and a model with `createAgent()` and pass that agent to a dispatch.

```ts
import {
  createAgent,
  createAnthropicModelProvider,
  createHarness,
} from "@elie-laloum/outpost";

export const agent = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: createAnthropicModelProvider({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    }),
  }),
});
```

Anthropic requires `maxOutputTokens`, hence the object form of `model`. Each model request is an HTTP call from your Node.js process; tools still run in the sandbox that the dispatch allocates.

## Choose a protocol

| Factory                        | `api`                          | Path added to `baseUrl` | Use it for                                                                        |
| ------------------------------ | ------------------------------ | ----------------------- | --------------------------------------------------------------------------------- |
| `createOpenAIModelProvider`    | `"chat-completions"` (default) | `/chat/completions`     | OpenAI and servers that expose Chat Completions.                                  |
| `createOpenAIModelProvider`    | `"responses"`                  | `/responses`            | The OpenAI Responses API.                                                         |
| `createAnthropicModelProvider` | none                           | `/messages`             | The Anthropic Messages API; `baseUrl` defaults to `https://api.anthropic.com/v1`. |

`baseUrl` is required for OpenAI and includes the version prefix. The protocol you choose is the only one used: an error never switches to another.

```ts
import { createOpenAIModelProvider } from "@elie-laloum/outpost";

const openai = createOpenAIModelProvider({
  baseUrl: "https://api.openai.com/v1",
  api: "responses",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});
```

`createCodexHarness({ modelProvider })` is a different setting: it points the Codex CLI, inside the sandbox, at a Responses-compatible service ([Codex](../codex/)).

## Use a local endpoint

Set `apiKey: false` for a server without authentication. The address is resolved from your host, not from the sandbox.

```ts
import { createOpenAIModelProvider } from "@elie-laloum/outpost";

const local = createOpenAIModelProvider({
  baseUrl: "http://127.0.0.1:8080/v1",
  apiKey: false,
});
```

## Keep the key on the host

Pass the model API key explicitly to the provider. These providers do not load account logins or read environment variables automatically. The key stays in your Node.js process; [Authentication](../authentication/) explains how this differs from CLI agents.

## Set the model and its reasoning

The agent’s `model` is a name or `{ name, reasoning, maxOutputTokens }`. `createAgent()` rejects settings the provider does not support.

API reference: [AgentModel](../../reference/agentmodel/).

The service still checks the model name and levels on each request.

## Stream text as it arrives

Both providers stream. The harness emits `text-delta` events while the model writes, and a `reasoning` event when a response contains readable reasoning. Print them from `observe` with `if (event.kind === "text-delta") process.stdout.write(event.text)` ([Follow progress](../progress/)).

## Bound each request

For example, `createOpenAIModelProvider({ apiKey, timeoutMs: 30_000 })` fails a request after thirty seconds without progress. While streaming, each received chunk restarts that timer. Add `deadlineMs` to the dispatch to bound a stream that keeps producing text.

API reference: [OpenAIModelProviderOptions](../../reference/openaimodelprovideroptions/) and [AnthropicModelProviderOptions](../../reference/anthropicmodelprovideroptions/).

A timeout fails with code `timeout`. The harness streams with both providers, so a long answer that keeps arriving never times out: bound the whole turn with [limits](../limits-and-cancellation/).

## Cache the prompt prefix

The harness’s `cache` option, on by default, asks the provider to reuse the conversation prefix between steps.

<!-- features -->

- **Anthropic**: `cache` marks the request for caching; `cacheSystem: true` adds a breakpoint on the harness instructions, which must then exist.
- **OpenAI**: Outpost sends no cache field; OpenAI caches stable prefixes on its side.
- **Usage**: Cache reads appear in `usage.cached`, and Anthropic cache writes in `usage.cacheCreated`.

A cache hit is never guaranteed.

## Retry after rate limits and outages

A provider sends each request once. When the service answers HTTP 429 with `Retry-After`, the error keeps that delay: a [task retry](../concurrency-and-retries/) waits at least that long, and a [quota pause](../quota-pauses/) resumes at that time.

Rate limits fail with code `quota`; overloads, 5xx and connection failures are marked unavailable for [fallback agents](../fallback-agents/). [Quota pauses](../quota-pauses/) list what counts as a quota.

## Connect another API

Implement [`ModelProvider`](../../reference/modelprovider/): `request()` returns a result, `stream()` and `validate()` are optional.

## Limits

- Reasoning is replayed only to the same provider, endpoint and model. Changing one drops it from the history.
- `baseUrl` cannot contain credentials, a query or a fragment. Redirects are refused.
- Anthropic responses with content other than text, tool calls and thinking fail with `response`.

API: [createOpenAIModelProvider](../../reference/createopenaimodelprovider/) · [createAnthropicModelProvider](../../reference/createanthropicmodelprovider/) · [OpenAIModelProviderOptions](../../reference/openaimodelprovideroptions/) · [AnthropicModelProviderOptions](../../reference/anthropicmodelprovideroptions/) · [ModelProvider](../../reference/modelprovider/) · [AgentModel](../../reference/agentmodel/).
