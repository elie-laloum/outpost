---
title: "summarizeHistory"
description: "summarizeHistory — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import { summarizeHistory } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a context strategy that, once the history exceeds a size, asks the model to summarize the older part and keeps the first prompt and the recent messages. Each summary costs one extra request.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name                         | Type                                   | Presence | Meaning                                                                          |
| ---------------------------- | -------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `options`                    | `SummarizeHistoryOptions \| undefined` | Optional | History size that triggers a summary and number of recent messages kept.         |
| `options.triggerCharacters`  | `number \| undefined`                  | Optional | Serialized history size that triggers a summary; defaults to 400,000 characters. |
| `options.keepRecentMessages` | `number \| undefined`                  | Optional | Number of recent messages kept after the summary; defaults to 6.                 |

## Returns

`HarnessContextStrategy`

## Signature

```ts
export declare function summarizeHistory(
  options?: SummarizeHistoryOptions,
): HarnessContextStrategy;
```

## Related contracts

- [HarnessContextStrategy](../harnesscontextstrategy/)
- [SummarizeHistoryOptions](../summarizehistoryoptions/)
