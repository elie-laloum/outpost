---
title: "ModelProvider"
description: "ModelProvider — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelProvider } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                                                        | Presence | Meaning                                                                                                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`                                                                    | Required | Provider name: openai or anthropic for the built-in providers.                                                                                                                                                                               |
| `identity` | `string \| undefined`                                                       | Optional | Stable key made of the provider name, protocol path and base URL, such as openai:responses:https://api.openai.com/v1. Built-in providers stamp it on reasoning blocks and replay them only to the same identity.                             |
| `validate` | `((model: AgentModel) => void) \| undefined`                                | Optional | Check called by createAgent() with the normalized agent model; throw to reject unsupported settings before any request. The Anthropic provider requires maxOutputTokens and rejects reasoning minimal; the OpenAI provider defines no check. |
| `request`  | `(request: ModelRequest) => Promise<ModelResult>`                           | Required | Send one request and resolve with its normalized result. Inside a harness, the request receives the agent model’s reasoning and maxOutputTokens and the run’s cancellation signal, and the reported usage is accounted once.                 |
| `stream`   | `((request: ModelRequest) => AsyncIterable<ModelStreamEvent>) \| undefined` | Optional | Streaming variant of request: yields text-delta events as the answer arrives, then one result event. The harness uses it instead of request when present.                                                                                    |

## Signature

```ts
export interface ModelProvider {
  readonly name: string;
  readonly identity?: string;
  validate?(model: AgentModel): void;
  request(request: ModelRequest): Promise<ModelResult>;
  stream?(request: ModelRequest): AsyncIterable<ModelStreamEvent>;
}
```

## Related contracts

- [AgentModel](../agentmodel/)
- [ModelRequest](../modelrequest/)
- [ModelResult](../modelresult/)
- [ModelStreamEvent](../modelstreamevent/)
