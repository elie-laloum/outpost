---
title: "HarnessContextStrategy"
description: "HarnessContextStrategy — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessContextStrategy } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                            | Presence | Meaning                                  |
| --------- | --------------------------------------------------------------- | -------- | ---------------------------------------- |
| `kind`    | `"context"`                                                     | Required | Definition discriminator: context.       |
| `name`    | `string`                                                        | Required | Name reported in compaction events.      |
| `compact` | `(input: HarnessContextInput) => Promise<HarnessContextResult>` | Required | Run the strategy before a model request. |

## Signature

```ts
export interface HarnessContextStrategy {
  readonly kind: "context";
  readonly name: string;
  compact(input: HarnessContextInput): Promise<HarnessContextResult>;
}
```

## Related contracts

- [HarnessContextInput](../harnesscontextinput/)
- [HarnessContextResult](../harnesscontextresult/)
