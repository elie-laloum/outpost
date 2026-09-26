---
title: "ModelRequest"
description: "ModelRequest — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change in a later release.
:::

## Import

```ts
import type { ModelRequest } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                                    | Presence | Meaning                                                                                                                                                                                                                  |
| ----------------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`           | `string`                                | Required | Nonempty service-specific model identifier; no local catalog or availability probe is used.                                                                                                                              |
| `prompt`          | `string \| undefined`                   | Optional | Nonempty text sent as a single user message. Use it or messages, never both; no repository content is collected automatically.                                                                                           |
| `messages`        | `readonly ModelMessage[] \| undefined`  | Optional | Conversation history starting and ending with a user message. Each tool call needs exactly one result in the next user message; reasoning blocks from another provider or model are dropped before sending.              |
| `system`          | `string \| undefined`                   | Optional | Optional instructions sent as a Chat Completions system message, Responses instructions or Anthropic system text.                                                                                                        |
| `tools`           | `readonly ModelToolSpec[] \| undefined` | Optional | Tools the model may call, with unique names and JSON Schema inputs. The provider translates them to its function or tool format; it never executes them.                                                                 |
| `maxOutputTokens` | `number \| undefined`                   | Optional | Positive output token limit sent as max_completion_tokens, max_output_tokens or max_tokens. Optional for OpenAI, required by Anthropic. Inside a custom harness it defaults to the agent model limit.                    |
| `reasoning`       | `ModelReasoning \| undefined`           | Optional | Optional reasoning effort for this request. OpenAI sends it as reasoning_effort or reasoning.effort; Anthropic maps none to disabled thinking and low to max to adaptive thinking with that effort, and rejects minimal. |
| `cache`           | `boolean \| undefined`                  | Optional | Ask Anthropic to cache the conversation prefix with an automatic breakpoint. OpenAI caches stable prefixes automatically and ignores the flag.                                                                           |
| `signal`          | `AbortSignal \| undefined`              | Optional | Caller-owned cancellation signal for this request, combined with the provider deadline. Cancellation does not dispose the reusable client.                                                                               |

## Signature

```ts
export interface ModelRequest {
  readonly model: string;
  readonly prompt?: string;
  readonly messages?: readonly ModelMessage[];
  readonly system?: string;
  readonly tools?: readonly ModelToolSpec[];
  readonly maxOutputTokens?: number;
  readonly reasoning?: ModelReasoning;
  readonly cache?: boolean;
  readonly signal?: AbortSignal;
}
```

## Related contracts

- [ModelMessage](../modelmessage/)
- [ModelReasoning](../modelreasoning/)
- [ModelToolSpec](../modeltoolspec/)
