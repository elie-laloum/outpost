---
title: "ModelRequest"
description: "ModelRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelRequest } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                                    | Presence | Meaning                                                                                                                                                                                                                                                      |
| ----------------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`           | `string`                                | Required | Nonempty service-specific model identifier; no local catalog or availability probe is used.                                                                                                                                                                  |
| `prompt`          | `string \| undefined`                   | Optional | Nonempty text sent as a single user message. Set exactly one of prompt and messages.                                                                                                                                                                         |
| `messages`        | `readonly ModelMessage[] \| undefined`  | Optional | Conversation history starting and ending with a user message. Each tool call needs exactly one result in the next user message; reasoning blocks from another provider or model are dropped before sending.                                                  |
| `system`          | `string \| undefined`                   | Optional | Instructions sent as the Chat Completions system message, the Responses instructions or the Anthropic system text.                                                                                                                                           |
| `tools`           | `readonly ModelToolSpec[] \| undefined` | Optional | Tools the model may call, with unique names and JSON Schema inputs. The provider translates them to its function or tool format; it never executes them.                                                                                                     |
| `maxOutputTokens` | `number \| undefined`                   | Optional | Positive output token limit, sent as max_completion_tokens (Chat Completions), max_output_tokens (Responses) or max_tokens (Anthropic). Anthropic requests fail with code configuration without it; inside a harness it defaults to the agent model’s limit. |
| `reasoning`       | `ModelReasoning \| undefined`           | Optional | Reasoning effort for this request. OpenAI protocols send the value unchanged as reasoning_effort or reasoning.effort; Anthropic maps none to disabled thinking, low to max to adaptive thinking at that effort, and rejects minimal.                         |
| `cache`           | `boolean \| undefined`                  | Optional | Ask Anthropic to cache the conversation prefix with an automatic breakpoint. OpenAI caches stable prefixes automatically and ignores the flag.                                                                                                               |
| `signal`          | `AbortSignal \| undefined`              | Optional | Cancellation signal for this request, combined with the provider deadline. Aborting rejects with code aborted; the provider stays reusable.                                                                                                                  |

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
