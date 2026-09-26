---
title: "ModelContentBlock"
description: "ModelContentBlock — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: provider-neutral messages, tool calls and replayable reasoning for model transports. No streaming yet; the contract may change before release.
:::

## Import

```ts
import type { ModelContentBlock } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name       | Type                                                    | Presence          | Meaning                                                                                                                                 |
| ---------- | ------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `type`     | `"text" \| "tool-call" \| "tool-result" \| "reasoning"` | Required          | Block discriminator: text.                                                                                                              |
| `text`     | `string`                                                | Variant-dependent | Plain text of the block; empty text blocks are not sent to Anthropic.                                                                   |
| `id`       | `string`                                                | Variant-dependent | Service-issued call identifier that the matching tool result must reference.                                                            |
| `name`     | `string`                                                | Variant-dependent | Name of the requested tool, as declared in the request tools.                                                                           |
| `input`    | `unknown`                                               | Variant-dependent | Parsed tool arguments. When the service returns invalid JSON, the raw string is kept so the caller can report the error to the model.   |
| `callId`   | `string`                                                | Variant-dependent | Identifier of the tool call this result answers.                                                                                        |
| `content`  | `string`                                                | Variant-dependent | Text returned to the model for this call.                                                                                               |
| `isError`  | `boolean \| undefined`                                  | Variant-dependent | Mark the result as a failed tool execution so the model can recover.                                                                    |
| `provider` | `string`                                                | Variant-dependent | Identity of the provider that produced the block; other providers never receive it.                                                     |
| `model`    | `string`                                                | Variant-dependent | Model that produced the block; it is replayed only to the same model.                                                                   |
| `data`     | `unknown`                                               | Variant-dependent | Opaque service payload, such as an Anthropic thinking block with its signature or an OpenAI encrypted reasoning item. Do not modify it. |

## Signature

```ts
export type ModelContentBlock =
  | ModelTextBlock
  | ModelToolCallBlock
  | ModelToolResultBlock
  | ModelReasoningBlock;
```

## Related contracts

- [ModelReasoningBlock](../modelreasoningblock/)
- [ModelTextBlock](../modeltextblock/)
- [ModelToolCallBlock](../modeltoolcallblock/)
- [ModelToolResultBlock](../modeltoolresultblock/)
