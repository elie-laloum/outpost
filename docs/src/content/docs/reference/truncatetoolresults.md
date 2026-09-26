---
title: "truncateToolResults"
description: "truncateToolResults — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Streaming is not available yet; the contract may change before release.
:::

## Import

```ts
import { truncateToolResults } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a context strategy that shortens the results of older tool calls and keeps the most recent ones intact. It changes nothing until an older result exceeds the limit.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name                    | Type                                      | Presence | Meaning                                                                            |
| ----------------------- | ----------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `options`               | `TruncateToolResultsOptions \| undefined` | Optional | Number of recent tool results kept intact and the length older results are cut to. |
| `options.keepRecent`    | `number \| undefined`                     | Optional | Number of most recent tool-result messages kept intact; defaults to 4.             |
| `options.maxCharacters` | `number \| undefined`                     | Optional | Length older tool results are cut to; defaults to 2,000 characters.                |

## Returns

`HarnessContextStrategy`

## Signature

```ts
export declare function truncateToolResults(
  options?: TruncateToolResultsOptions,
): HarnessContextStrategy;
```

## Related contracts

- [HarnessContextStrategy](../harnesscontextstrategy/)
- [TruncateToolResultsOptions](../truncatetoolresultsoptions/)
