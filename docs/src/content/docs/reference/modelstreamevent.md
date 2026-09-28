---
title: "ModelStreamEvent"
description: "ModelStreamEvent — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change in a later release.
:::

## Import

```ts
import type { ModelStreamEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name      | Type                                                 | Presence          | Meaning                                                                   |
| --------- | ---------------------------------------------------- | ----------------- | ------------------------------------------------------------------------- |
| `type`    | `"reasoning" \| "retry" \| "text-delta" \| "result"` | Required          | text-delta for a fragment of answer text, or result for the final result. |
| `text`    | `string`                                             | Variant-dependent | Fragment of answer text, in arrival order.                                |
| `attempt` | `number`                                             | Variant-dependent | Provider-reported retry attempt; emitting it does not request a retry.    |
| `message` | `string \| undefined`                                | Variant-dependent | Optional diagnostic associated with the provider-reported retry.          |
| `result`  | `ModelResult`                                        | Variant-dependent | Final normalized result, identical to a non-streaming request.            |

## Signature

```ts
export type ModelStreamEvent =
  | {
      readonly type: "reasoning";
      readonly text: string;
    }
  | {
      readonly type: "retry";
      readonly attempt: number;
      readonly message?: string;
    }
  | {
      readonly type: "text-delta";
      readonly text: string;
    }
  | {
      readonly type: "result";
      readonly result: ModelResult;
    };
```

## Related contracts

- [ModelResult](../modelresult/)
