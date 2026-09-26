---
title: "ModelResult"
description: "ModelResult — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change in a later release.
:::

## Import

```ts
import type { ModelResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                        | Presence | Meaning                                                                                                                                                                                      |
| ------------ | ------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`       | `string`                                    | Required | Concatenated text blocks of the response; empty when the model only called tools.                                                                                                            |
| `content`    | `readonly ModelContentBlock[] \| undefined` | Optional | Normalized response blocks in model order: text, tool calls and opaque reasoning to replay unchanged in later requests. Built-in providers always return it.                                 |
| `stopReason` | `ModelStopReason \| undefined`              | Optional | Why the model stopped: end, tool-calls, max-tokens or refusal. A max-tokens result may contain truncated text or incomplete tool calls.                                                      |
| `usage`      | `Usage \| undefined`                        | Optional | Token counts reported by the service, when present. Missing usage stays absent; missing cached-token details become zero. This is not a billing estimate or automatic workflow usage report. |

## Signature

```ts
export interface ModelResult {
  readonly text: string;
  readonly content?: readonly ModelContentBlock[];
  readonly stopReason?: ModelStopReason;
  readonly usage?: Usage;
}
```

## Related contracts

- [ModelContentBlock](../modelcontentblock/)
- [ModelStopReason](../modelstopreason/)
- [Usage](../usage/)
