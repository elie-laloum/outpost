---
title: "truncateToolResults"
description: "truncateToolResults — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { truncateToolResults } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a context strategy that cuts older tool results to maxCharacters, appending a truncation marker, and leaves the keepRecent most recent tool-result messages intact. It returns nothing while no older result exceeds the limit.

[Complete example and detailed rules](../../guide/harness-context/).

## Parameters and properties

| Name                    | Type                                      | Presence | Meaning                                                                            |
| ----------------------- | ----------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `options`               | `TruncateToolResultsOptions \| undefined` | Optional | Number of recent tool results kept intact and the length older results are cut to. |
| `options.keepRecent`    | `number \| undefined`                     | Optional | Number of most recent tool-result messages kept intact, default 4.                 |
| `options.maxCharacters` | `number \| undefined`                     | Optional | Length older tool results are cut to, default 2000 characters.                     |

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
