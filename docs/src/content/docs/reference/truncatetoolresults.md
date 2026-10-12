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

<span id="outpost-instructions"></span>

## Instructions added by Outpost

Templates below preserve the English text sent to the model. `${…}` marks runtime substitutions, not brief template syntax.

When an older tool result exceeds `maxCharacters`, its content is replaced with:

```text
${retainedContent}
[earlier output truncated from ${originalLength} characters]
```

`retainedContent` is the first `maxCharacters` JavaScript string code units; `originalLength` is the original string's `length`. This is a marker in the tool result, not a separate model request. Its wording is fixed. Change `maxCharacters` or `keepRecent` to control truncation, or supply a custom context strategy to use another transformation.

Implementation: [context.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/context.ts).

## Signature

```ts
export declare function truncateToolResults(
  options?: TruncateToolResultsOptions,
): HarnessContextStrategy;
```

## Related contracts

- [HarnessContextStrategy](../harnesscontextstrategy/)
- [TruncateToolResultsOptions](../truncatetoolresultsoptions/)
