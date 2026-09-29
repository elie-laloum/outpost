---
title: "ModelStreamEvent"
description: "ModelStreamEvent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ModelStreamEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name      | Type                                                 | Presence          | Meaning                                                                                                                                                                                           |
| --------- | ---------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`    | `"reasoning" \| "retry" \| "text-delta" \| "result"` | Required          | text-delta for a fragment of answer text, reasoning for readable reasoning, retry for a provider-reported retry, result for the final result. Built-in providers emit only text-delta and result. |
| `text`    | `string`                                             | Variant-dependent | Fragment of answer text for text-delta, or readable reasoning for reasoning, in arrival order. The harness forwards both as events of the same kind.                                              |
| `attempt` | `number`                                             | Variant-dependent | Retry attempt number reported by the provider. The harness forwards it as a model-retry event and does not retry itself.                                                                          |
| `message` | `string \| undefined`                                | Variant-dependent | Diagnostic for the reported retry, forwarded in the model-retry event.                                                                                                                            |
| `result`  | `ModelResult`                                        | Variant-dependent | Final normalized result, identical to a non-streaming request. The harness requires exactly one per stream.                                                                                       |

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
