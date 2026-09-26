---
title: "HarnessContextStrategyOptions"
description: "HarnessContextStrategyOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessContextStrategyOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                                                    | Presence | Meaning                                                                                                                                                          |
| --------- | --------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                                                | Required | Nonempty name reported in compaction events.                                                                                                                     |
| `compact` | `(input: HarnessContextInput) => HarnessContextResult \| Promise<HarnessContextResult>` | Required | Return a rewritten message list, or nothing to keep the history. The list must start and end with a user message and keep each tool call paired with its result. |

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
