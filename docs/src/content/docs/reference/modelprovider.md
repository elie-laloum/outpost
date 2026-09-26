---
title: "ModelProvider"
description: "ModelProvider — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: bounded text requests and caller-supplied harness execution. No built-in tool loop, streaming or native custom-harness conversation persistence.
:::

## Import

```ts
import type { ModelProvider } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                              | Presence | Meaning                                                                                                                                                    |
| ---------- | ------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`                                          | Required | Provider identity; the built-in direct client reports openai-compatible.                                                                                   |
| `identity` | `string \| undefined`                             | Optional | Stable key combining the protocol and endpoint. Reasoning blocks carry it so they are replayed only to the service that produced them.                     |
| `validate` | `((model: AgentModel) => void) \| undefined`      | Optional | Optional check called by agent() with the normalized AgentModel; throw to reject unsupported reasoning levels or missing output limits before any request. |
| `request`  | `(request: ModelRequest) => Promise<ModelResult>` | Required | Perform one bounded, non-streaming request for the supplied model. The harness-scoped wrapper propagates cancellation and records reported usage once.     |

## Signature

```ts
export interface ModelProvider {
  readonly name: string;
  readonly identity?: string;
  validate?(model: AgentModel): void;
  request(request: ModelRequest): Promise<ModelResult>;
}
```

## Related contracts

- [AgentModel](../agentmodel/)
- [ModelRequest](../modelrequest/)
- [ModelResult](../modelresult/)
