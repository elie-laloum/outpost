---
title: Model providers (experimental)
description: Configure the HTTP transports that custom harnesses use to call a model.
sidebar:
  order: 8
---

:::caution[Experimental API]
Since 5.0.0, model providers replace the experimental direct client from 4.2.0. They send bounded requests with messages and tool calls, with or without streaming. Tests use local simulated services; their contracts may still change.
:::

`openaiModelProvider()` configures an HTTP service using Chat Completions or Responses. `anthropicModelProvider()` uses Anthropic Messages. A [custom harness](../../agents/harness/) owns its provider and drives it; the agent selects the model with a name or a `{ name, reasoning, maxOutputTokens }` object. An unknown or inaccessible model fails when the service is called, without catalog lookup or model substitution.

A `sandboxProvider` allocates the execution environment. Its constructors have explicit names such as `dockerSandboxProvider()` and `localSandboxProvider()`. Model providers do not allocate sandboxes.

## Call a provider directly

<details>
<summary>Complete preparation and executable example</summary>

Use Node.js 24+ and npm. In a new directory, install Outpost:

```sh
mkdir model-example
cd model-example
npm init -y
npm install @elie-laloum/outpost
```

Create an ignored `.env` file with `MODEL_BASE_URL`, `MODEL_NAME` and `MODEL_API_KEY`. The service receives the prompt and can charge for API usage; CLI subscription credentials are not used.

Save **example.mts**:

```ts
import { openaiModelProvider } from "@elie-laloum/outpost";

const baseUrl = process.env.MODEL_BASE_URL;
const model = process.env.MODEL_NAME;
const apiKey = process.env.MODEL_API_KEY;
if (!baseUrl || !model || !apiKey) {
  throw new Error("Set MODEL_BASE_URL, MODEL_NAME and MODEL_API_KEY");
}

const provider = openaiModelProvider({ baseUrl, apiKey });
const result = await provider.request({
  model,
  system: "Answer concisely.",
  prompt: "Explain the difference between a model and a harness.",
  maxOutputTokens: 512,
  reasoning: "low",
});
console.log(result.stopReason, result.text);
console.log(result.usage);
```

Run `node --env-file=.env example.mts`. The command prints the stop reason, the answer and the reported usage. No sandbox is involved: a provider only transports requests. To let a model use tools in a repository, compose the provider into a [custom harness](../../agents/harness/).

</details>

## Reasoning and output limits

`reasoning` and `maxOutputTokens` belong to the agent model. `agent()` calls the provider's `validate()` first, so an unsupported setting fails before any sandbox or request exists. A custom harness adds both values to each request. A direct call passes them in the request.

| Provider                | `reasoning`                                                                                            | `maxOutputTokens`       |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------- |
| OpenAI Chat Completions | `reasoning_effort`, any of the seven levels                                                            | `max_completion_tokens` |
| OpenAI Responses        | `reasoning.effort`, any of the seven levels                                                            | `max_output_tokens`     |
| Anthropic Messages      | `none` disables thinking; `low` to `max` use adaptive thinking with that effort; `minimal` is rejected | `max_tokens`, required  |

The seven levels are `none`, `minimal`, `low`, `medium`, `high`, `xhigh` and `max`. OpenAI forwards them unchanged, so the service decides which levels a given model accepts. Some Anthropic models cannot disable thinking and reject `none`.

## Messages, tool calls and reasoning replay

A request carries either `prompt` or `messages`. Messages start and end with a user message. Each assistant `tool-call` block needs exactly one `tool-result` block in the next user message; the request is rejected otherwise. Declare callable tools in `tools` with a name, a description and a JSON Schema. The provider translates them to Chat Completions functions, Responses function items or Anthropic tools, and never executes them.

The result keeps the response blocks in `content` and explains the end of the turn in `stopReason`:

| `stopReason` | Meaning                                                                |
| ------------ | ---------------------------------------------------------------------- |
| `end`        | Final answer in `text`.                                                |
| `tool-calls` | The model requested tools; answer every call before the next request.  |
| `max-tokens` | The output limit was reached; text or tool arguments may be truncated. |
| `refusal`    | The service refused or filtered the answer.                            |

Append the returned `content` unchanged as the next assistant message. It can include `reasoning` blocks: Anthropic thinking with its signature, or OpenAI encrypted reasoning items. Each block records the provider `identity` and model that produced it, and is sent back only to that same pair. Chat Completions cannot replay reasoning, so its blocks are dropped. Invalid JSON tool arguments are kept as the raw string, so the caller can answer with an error result.

With `cache: true`, Anthropic caches the conversation prefix through an automatic breakpoint. OpenAI caches stable prefixes on its own and ignores the flag. Keep the system text and tool list identical between requests to benefit from either cache.

## Streaming

Built-in providers also implement `stream(request)`. It sends the same request with streaming enabled and yields `{ type: "text-delta", text }` events while the answer arrives, then one `{ type: "result", result }` with the same `ModelResult` a non-streaming request returns:

```ts
import { openaiModelProvider } from "@elie-laloum/outpost";

const provider = openaiModelProvider({
  baseUrl: "https://api.openai.com/v1",
  apiKey: process.env.OPENAI_API_KEY ?? "",
  api: "responses",
});
for await (const event of provider.stream!({
  model: "gpt-5.5",
  prompt: "Hi",
})) {
  if (event.type === "text-delta") process.stdout.write(event.text);
  if (event.type === "result") console.log("\n", event.result.usage);
}
```

For streams, `timeoutMs` bounds the silence between two received chunks instead of the whole request, so long answers are not cut while data keeps arriving. `maxResponseBytes` still bounds the total size. Chat Completions requests usage with `stream_options.include_usage`. A custom harness uses `stream()` automatically when its provider implements it, and forwards the deltas as `text-delta` events.

## Request ownership and bounds

Providers run in the Outpost process and never touch the sandbox. Inside a custom harness, each request uses the agent's model, inherits the turn's cancellation and deadline, and adds its reported usage once to the dispatch usage. A provider built by hand can implement `ModelProvider` directly; it must return `text`, and should return `content` and `stopReason` so the harness can run tools.

The OpenAI protocol defaults to `chat-completions`; select `api: "responses"` explicitly when required. No automatic retry, redirect following or protocol fallback is performed. Keys are explicit, URLs cannot embed credentials, and errors omit remote response bodies. `localhost` refers to the process running Outpost, even when repository commands run in a remote sandbox. Cancellation does not prove remote generation or billing stopped.

## Anthropic and system cache

Configure `anthropicModelProvider({ apiKey, cacheSystem: true })`, and set `maxOutputTokens` on the agent model or the request. Each request must then include system instructions. The provider places an ephemeral cache breakpoint on that system text. Cache eligibility and hits remain service-dependent. This follows [Anthropic's prompt caching contract](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

Reported `usage.input` includes uncached input, cache creation and cache reads; `cached` and `cacheCreated` are subsets, not additional totals. The provider uses the [Messages API](https://platform.claude.com/docs/en/api/messages/create), with the output limit taken from the request or the agent model. `pause_turn` is rejected because server tools are not supported.

[Model providers reference](../../../reference/overview/model-providers/) · [Build a custom harness](../../agents/harness/) · [Remaining harness work](../../../project/roadmap/#direct-model-harness)
