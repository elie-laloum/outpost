---
title: "defineHarnessContextStrategy"
description: "defineHarnessContextStrategy — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessContextStrategy } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define how a built-in harness rewrites its history before each model request. compact receives the messages and a summarize() helper and returns a new list or nothing; the harness validates the list, removes replayed reasoning and records a compaction in the transcript.

[Complete example and detailed rules](../../guide/harness-context/).

## Parameters and properties

| Name              | Type                                                                                    | Presence | Meaning                                                                                                                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `HarnessContextStrategyOptions`                                                         | Required | Strategy name and compact function.                                                                                                                                                                                                      |
| `options.name`    | `string`                                                                                | Required | Nonempty name reported in compaction events.                                                                                                                                                                                             |
| `options.compact` | `(input: HarnessContextInput) => HarnessContextResult \| Promise<HarnessContextResult>` | Required | Called before every model request; returns a rewritten message list, or nothing to keep the history. The list must start and end with a user message and pair each tool call with its result, or the turn fails with code configuration. |

## Returns

`HarnessContextStrategy`

## Signature

```ts
export declare function defineHarnessContextStrategy(
  options: HarnessContextStrategyOptions,
): HarnessContextStrategy;
```

## Related contracts

- [HarnessContextStrategy](../harnesscontextstrategy/)
- [HarnessContextStrategyOptions](../harnesscontextstrategyoptions/)
