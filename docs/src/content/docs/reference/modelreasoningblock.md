---
title: "ModelReasoningBlock"
description: "ModelReasoningBlock — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change in a later release.
:::

## Import

```ts
import type { ModelReasoningBlock } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type          | Presence | Meaning                                                                                                                                 |
| ---------- | ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `type`     | `"reasoning"` | Required | Block discriminator: reasoning.                                                                                                         |
| `provider` | `string`      | Required | Identity of the provider that produced the block; other providers never receive it.                                                     |
| `model`    | `string`      | Required | Model that produced the block; it is replayed only to the same model.                                                                   |
| `data`     | `unknown`     | Required | Opaque service payload, such as an Anthropic thinking block with its signature or an OpenAI encrypted reasoning item. Do not modify it. |

## Signature

```ts
export interface ModelReasoningBlock {
  readonly type: "reasoning";
  readonly provider: string;
  readonly model: string;
  readonly data: unknown;
}
```
