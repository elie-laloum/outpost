---
title: "summarizeHistory"
description: "summarizeHistory — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { summarizeHistory } from "@elie-laloum/outpost/harness";
```

## Purpose and behavior

Create a context strategy that, once the serialized history exceeds triggerCharacters, replaces the older messages with a model-written summary and keeps the first prompt and the recent messages. Each summary is one extra model request counted in usage and budgets; an empty or cut-off summary fails the turn with code response.

[Complete example and detailed rules](../../guide/harness-context/).

## Parameters and properties

| Name                         | Type                                   | Presence | Meaning                                                                                                                                                                                    |
| ---------------------------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                    | `SummarizeHistoryOptions \| undefined` | Optional | History size that triggers a summary and number of recent messages kept.                                                                                                                   |
| `options.triggerCharacters`  | `number \| undefined`                  | Optional | Length of the JSON-serialized history above which a summary is made, default 400000 characters. [Exact injected text and customization limits](../summarizehistory/#outpost-instructions). |
| `options.keepRecentMessages` | `number \| undefined`                  | Optional | Minimum number of recent messages kept after the summary, default 6; the cut moves back to the previous assistant message.                                                                 |

## Returns

`HarnessContextStrategy`

<span id="outpost-instructions"></span>

## Instructions added by Outpost

Templates below preserve the English text sent to the model. `${…}` marks runtime substitutions, not brief template syntax.

When compaction triggers, Outpost sends this system instruction to the active agent model in a separate summary request:

```text
Summarize this earlier part of an agent conversation for the agent that will continue it. Keep the task, decisions, files and commands involved, results, errors and open questions. Be factual and concise.
```

The user prompt contains the older messages, separated by blank lines. Each message starts with `User:
` or `Assistant:
`. Text blocks are kept; tool calls become `[tool call ${name} ${inputJSON}]`; results become `[tool result]
${content}` or `[tool error]
${content}`. Reasoning blocks are omitted. An empty message list is rendered as `(no earlier messages)`.

The result is inserted into the effective history as a user message, after the first message and before the retained recent messages:

```text
Summary of the earlier conversation:
${summary}
```

The summary instruction and prefix are fixed. `triggerCharacters` and `keepRecentMessages` control when and how much to summarize. A custom [context strategy](../defineharnesscontextstrategy/) can replace the compaction mechanism, but calling `input.summarize()` still uses this fixed instruction. The built-in summary request counts toward usage and budgets.

Implementation: [context.constants.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/context.constants.ts) · [harness-context.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/harness-context.ts) · [context.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/context.ts).

## Signature

```ts
export declare function summarizeHistory(
  options?: SummarizeHistoryOptions,
): HarnessContextStrategy;
```

## Related contracts

- [HarnessContextStrategy](../harnesscontextstrategy/)
- [SummarizeHistoryOptions](../summarizehistoryoptions/)
