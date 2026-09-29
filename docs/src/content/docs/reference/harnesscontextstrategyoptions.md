---
title: "HarnessContextStrategyOptions"
description: "HarnessContextStrategyOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessContextStrategyOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                                                    | Presence | Meaning                                                                                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                                                | Required | Nonempty name reported in compaction events.                                                                                                                                                                                             |
| `compact` | `(input: HarnessContextInput) => HarnessContextResult \| Promise<HarnessContextResult>` | Required | Called before every model request; returns a rewritten message list, or nothing to keep the history. The list must start and end with a user message and pair each tool call with its result, or the turn fails with code configuration. |

## Signature

```ts
export interface HarnessContextStrategyOptions {
  readonly name: string;
  compact(
    input: HarnessContextInput,
  ): HarnessContextResult | Promise<HarnessContextResult>;
}
```

## Related contracts

- [HarnessContextInput](../harnesscontextinput/)
- [HarnessContextResult](../harnesscontextresult/)
