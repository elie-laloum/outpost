---
title: Direct model providers (experimental)
description: Call compatible text APIs without Codex; the agent harness is planned separately.
sidebar:
  order: 8
---

:::caution[Experimental — phase one]
`openaiCompatible()` implements direct text generation without Codex. It has no agent harness: tools, repository edits, automatic context collection and conversation persistence are not implemented. Its API may change. Available since Outpost 4.2.0 as an experimental API.
:::

A model provider chooses the HTTP service that generates text. A [sandbox provider](../../environment/providers/overview/) chooses where commands execute. This client runs in the process that calls `generate()` and allocates no sandbox. It cannot be passed as `agent` or `provider` to `dispatch()` or `createSandbox()`.

## Make a direct call

<details>
<summary>Complete preparation and executable example</summary>

Use Node.js 24+ and npm. Install Outpost 4.2.0 or later in a new example directory:

```sh
mkdir model-example
cd model-example
npm init -y
npm install '@elie-laloum/outpost@^4.2.0'
```

Create an ignored `.env` file declaring `MODEL_BASE_URL`, `MODEL_NAME` and `MODEL_API_KEY`. Use the chosen service's API base URL, including its version prefix, and one of its available model identifiers. The call sends the prompt and key to that service and can incur its API charges. No Codex or ChatGPT account session is used. Do not commit the key.

Save this as `example.mts`:

```ts
import { openaiCompatible } from "@elie-laloum/outpost";

const baseUrl = process.env.MODEL_BASE_URL;
const model = process.env.MODEL_NAME;
const apiKey = process.env.MODEL_API_KEY;
if (!baseUrl || !model || !apiKey) {
  throw new Error("Set MODEL_BASE_URL, MODEL_NAME and MODEL_API_KEY");
}

const provider = openaiCompatible({
  baseUrl,
  model,
  apiKey,
  api: "chat-completions",
  timeoutMs: 60_000,
});
const result = await provider.generate({
  system: "Answer concisely.",
  prompt: "Explain the difference between a model API and a coding agent.",
  maxOutputTokens: 512,
});
console.log(result.text);
console.log(result.usage ?? "Usage was not reported by the service");
```

Run:

```sh
node --env-file=.env example.mts
```

The program prints the complete answer and token usage when the service supplies it. No repository files are inspected or changed. An unsuccessful request rejects and the command exits with an error.

</details>

## Protocol and authentication

Select `api: "chat-completions"` (the default) for `POST <baseUrl>/chat/completions`, or `api: "responses"` for `POST <baseUrl>/responses`. Protocol selection is explicit; the client never retries with a different protocol. The [official API migration guide](https://developers.openai.com/api/docs/guides/migrate-to-responses) explains the two message formats. This implementation handles only non-streaming text and sends `store: false`; service retention policies still apply.

Pass the bearer key explicitly through `apiKey`; no host environment variable, keychain or CLI login is discovered. Use `apiKey: false` only for an intentionally unauthenticated endpoint. URLs cannot contain credentials, a query or a fragment, and redirects are refused. `localhost` means the machine running this call. No new vendor SDK is required.

The service must support the selected request fields, including `max_completion_tokens` for Chat Completions or `max_output_tokens` for Responses when `maxOutputTokens` is set. Responses output must contain completed assistant messages. An “OpenAI-compatible” label is not proof that every protocol or model supports this subset. The existing [Codex model configuration](../../behavior/agents/connect-codex/#openai-compatible-model-providers) remains a separate Responses-only path with the Codex harness.

## Bounds, results and failures

Each call is independent. Pass `signal` to cancel it; `timeoutMs` defaults to 120 seconds and covers the full response body. `maxResponseBytes` defaults to 8 MiB after HTTP decompression. The client can be reused after cancellation or failure and owns no sandbox to dispose.

HTTP, transport, malformed JSON, truncated outputs, refusals and tool calls reject. Unsupported request fields, including tools and streaming, also reject. Errors omit the remote body and credentials. No automatic retry risks duplicating an API charge. Usage remains absent if the service omits it; reported usage is not a billing estimate and is not automatically added to workflow budgets. A cancelled HTTP request does not prove that the remote service stopped generation or billing.

## Phase two: the agent harness

The planned harness will connect model turns to controlled tools: reading and editing files, running commands through sandbox leases, returning tool results to the model, managing context and conversations, and enforcing execution budgets and cancellation. Integration with dispatch, recovery and structured responses needs its own contracts and validation. None of these capabilities is included in phase one.

Current tests cover simulated local HTTP endpoints. Authenticated service compatibility and the harness remain separate validation work in the [roadmap](../../../project/roadmap/#direct-model-harness).

[Model provider reference](../../../reference/overview/model-providers/) · [openaiCompatible](../../../reference/openaicompatible/)
