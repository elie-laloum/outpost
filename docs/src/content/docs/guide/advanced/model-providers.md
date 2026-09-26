---
title: Model providers and custom harnesses (experimental)
description: Compose a model request transport with a caller-supplied harness.
sidebar:
  order: 8
---

:::caution[Unreleased API]
This working-tree API replaces the experimental direct client from 4.2.0. Use a package built from this checkout. It provides bounded requests with messages and tool calls, plus a custom callback, without a built-in tool loop, streaming or native custom conversations.
:::

`openaiModelProvider()` configures an HTTP service using Chat Completions or Responses. `anthropicModelProvider()` uses Anthropic Messages. The harness owns the provider; the agent selects the model with a name or a `{ name, reasoning, maxOutputTokens }` object. An unknown or inaccessible model fails when the service is called, without catalog lookup or model substitution.

A `sandboxProvider` allocates the execution environment. Its constructors have explicit names such as `dockerSandboxProvider()` and `localSandboxProvider()`. Model providers do not allocate sandboxes.

## Execute a custom harness

<details>
<summary>Complete preparation and executable example</summary>

Use Node.js 24+, npm and Git. Build this checkout with `npm ci` and `npm run build`. In a new directory, install that local package:

```sh
mkdir model-example
cd model-example
npm init -y
npm install /absolute/path/to/outpost
git init
git -c user.name=Example -c user.email=example@example.test commit --allow-empty -m "Initial"
```

Create an ignored `.env` file with `MODEL_BASE_URL`, `MODEL_NAME` and `MODEL_API_KEY`. The service receives the prompt and can charge for API usage; CLI subscription credentials are not used.

Save **example.mts**:

```ts
import {
  agent,
  harness,
  dispatch,
  openaiModelProvider,
} from "@elie-laloum/outpost";
import { localSandboxProvider } from "@elie-laloum/outpost/providers/local";

const baseUrl = process.env.MODEL_BASE_URL;
const model = process.env.MODEL_NAME;
const apiKey = process.env.MODEL_API_KEY;
if (!baseUrl || !model || !apiKey) {
  throw new Error("Set MODEL_BASE_URL, MODEL_NAME and MODEL_API_KEY");
}

const worker = agent({
  model: { name: model, reasoning: "low", maxOutputTokens: 512 },
  harness: harness({
    modelProvider: openaiModelProvider({ baseUrl, apiKey }),
    async run(input, context) {
      return context.modelProvider.request({
        model: context.model,
        system: "Answer concisely.",
        prompt: input.prompt,
      });
    },
  }),
});

const result = await dispatch({
  repository: import.meta.dirname,
  sandboxProvider: localSandboxProvider(),
  agent: worker,
  brief: { text: "Explain the difference between a model and a harness." },
});
console.log(result.text);
console.log(result.usage);
```

Run `node --env-file=.env example.mts`. The command prints the answer and accumulated reported usage, then closes its owned sandbox. This callback runs no repository commands. `localSandboxProvider()` is unisolated host execution.

</details>

## Reasoning and output limits

`reasoning` and `maxOutputTokens` belong to the agent model. `agent()` calls the provider's `validate()` first, so an unsupported setting fails before any sandbox or request exists. Requests through `context.modelProvider` inherit both values unless the request sets its own.

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

## Request ownership and bounds

The callback executes in the Outpost process. Use `context.sandbox` for repository commands and transfers, and await all operations. It borrows the lease and cannot release it. Commands and requests inherit turn cancellation; arbitrary JavaScript callbacks must cooperate with `context.signal`. Outpost waits for its tracked operations to settle before ending the turn.

Requests through `context.modelProvider` use the agent's model and accumulate reported usage once, even when the returned result repeats the last call's usage. Without such reports, the callback may return its own usage. Observations cannot override result accounting or create conversations. Resume, fork, automatic response repairs and interactive attachment are unsupported for custom harnesses.

The OpenAI protocol defaults to `chat-completions`; select `api: "responses"` explicitly when required. No automatic retry, redirect following or protocol fallback is performed. Keys are explicit, URLs cannot embed credentials, and errors omit remote response bodies. `localhost` refers to the process running Outpost, even when repository commands run in a remote sandbox. Cancellation does not prove remote generation or billing stopped.

## Anthropic and system cache

Configure `anthropicModelProvider({ apiKey, cacheSystem: true })` as the harness's provider, and set `maxOutputTokens` on the agent model. Each request must then include system instructions. The provider places an ephemeral cache breakpoint on that system text. Cache eligibility and hits remain service-dependent. This follows [Anthropic's prompt caching contract](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

Reported `usage.input` includes uncached input, cache creation and cache reads; `cached` and `cacheCreated` are subsets, not additional totals. The provider uses the [Messages API](https://platform.claude.com/docs/en/api/messages/create), with the output limit taken from the request or the agent model. `pause_turn` is rejected because server tools are not supported.

[Model providers reference](../../../reference/overview/model-providers/) · [Remaining tool engine work](../../../project/roadmap/#direct-model-harness)
