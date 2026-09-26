---
title: "defineHarnessContextStrategy"
description: "defineHarnessContextStrategy — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. The contract may change before release.
:::

## Import

```ts
import { defineHarnessContextStrategy } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define how a custom harness rewrites its history before a model request. compact receives the messages and a summarize() helper and returns a new list or nothing; the engine validates it, removes replayed reasoning and records a compaction in the transcript.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name              | Type                                                                                    | Presence | Meaning                                                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `HarnessContextStrategyOptions`                                                         | Required | Strategy name and compact function.                                                                                                                              |
| `options.name`    | `string`                                                                                | Required | Nonempty name reported in compaction events.                                                                                                                     |
| `options.compact` | `(input: HarnessContextInput) => HarnessContextResult \| Promise<HarnessContextResult>` | Required | Return a rewritten message list, or nothing to keep the history. The list must start and end with a user message and keep each tool call paired with its result. |

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
