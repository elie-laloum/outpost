---
title: "summarizeHistory"
description: "summarizeHistory — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { summarizeHistory } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a context strategy that, once the serialized history exceeds triggerCharacters, replaces the older messages with a model-written summary and keeps the first prompt and the recent messages. Each summary is one extra model request counted in usage and budgets; an empty or cut-off summary fails the turn with code response.

[Complete example and detailed rules](../../guide/harness-context/).

## Parameters and properties

| Name                         | Type                                   | Presence | Meaning                                                                                                                    |
| ---------------------------- | -------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SummarizeHistoryOptions \| undefined` | Optional | History size that triggers a summary and number of recent messages kept.                                                   |
| `options.triggerCharacters`  | `number \| undefined`                  | Optional | Length of the JSON-serialized history above which a summary is made, default 400000 characters.                            |
| `options.keepRecentMessages` | `number \| undefined`                  | Optional | Minimum number of recent messages kept after the summary, default 6; the cut moves back to the previous assistant message. |

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
