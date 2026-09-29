---
title: "ModelReasoningBlock"
description: "ModelReasoningBlock — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelReasoningBlock } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                  | Presence | Meaning                                                                                                                                                       |
| ---------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`     | `string \| undefined` | Optional | Readable reasoning exposed by the service: the Anthropic thinking text or the Responses summary. The harness emits it as a reasoning event; replay uses data. |
| `type`     | `"reasoning"`         | Required | Block discriminator: reasoning.                                                                                                                               |
| `provider` | `string`              | Required | Identity of the provider that produced the block; other providers never receive it.                                                                           |
| `model`    | `string`              | Required | Model that produced the block; it is replayed only to the same model.                                                                                         |
| `data`     | `unknown`             | Required | Opaque service payload: an Anthropic thinking or redacted_thinking block with its signature, or an OpenAI Responses reasoning item. Replay it unchanged.      |

## Signature

```ts
export interface ModelReasoningBlock {
  readonly text?: string;
  readonly type: "reasoning";
  readonly provider: string;
  readonly model: string;
  readonly data: unknown;
}
```
