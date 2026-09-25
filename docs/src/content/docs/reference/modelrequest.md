---
title: "ModelRequest"
description: "ModelRequest — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: bounded text requests and caller-supplied harness execution. No built-in tool loop, streaming or native custom-harness conversation persistence.
:::

## Import

```ts
import type { ModelRequest } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                          | Presence | Meaning                                                                                                                                                                                                                  |
| ----------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`           | `string`                      | Required | Nonempty service-specific model identifier; no local catalog or availability probe is used.                                                                                                                              |
| `prompt`          | `string`                      | Required | Nonempty text sent as this request’s user input; no repository content is collected automatically.                                                                                                                       |
| `system`          | `string \| undefined`         | Optional | Optional text sent as a Chat Completions system message or Responses instructions.                                                                                                                                       |
| `maxOutputTokens` | `number \| undefined`         | Optional | Positive output token limit sent as max_completion_tokens, max_output_tokens or max_tokens. Optional for OpenAI, required by Anthropic. Inside a custom harness it defaults to the agent model limit.                    |
| `reasoning`       | `ModelReasoning \| undefined` | Optional | Optional reasoning effort for this request. OpenAI sends it as reasoning_effort or reasoning.effort; Anthropic maps none to disabled thinking and low to max to adaptive thinking with that effort, and rejects minimal. |
| `signal`          | `AbortSignal \| undefined`    | Optional | Caller-owned cancellation signal for this request, combined with the provider deadline. Cancellation does not dispose the reusable client.                                                                               |

## Signature

```ts
export interface ModelRequest {
  readonly model: string;
  readonly prompt: string;
  readonly system?: string;
  readonly maxOutputTokens?: number;
  readonly reasoning?: ModelReasoning;
  readonly signal?: AbortSignal;
}
```

## Related contracts

- [ModelReasoning](../modelreasoning/)
