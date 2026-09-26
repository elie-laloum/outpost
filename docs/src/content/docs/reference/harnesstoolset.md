---
title: "HarnessToolset"
description: "HarnessToolset — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { HarnessToolset } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                              | Presence | Meaning                            |
| ------- | --------------------------------- | -------- | ---------------------------------- |
| `kind`  | `"toolset"`                       | Required | Definition discriminator: toolset. |
| `name`  | `string`                          | Required | Name identifying the toolset.      |
| `tools` | `readonly HarnessTool<unknown>[]` | Required | Flattened, frozen tool list.       |

## Signature

```ts
export interface HarnessToolset {
  readonly kind: "toolset";
  readonly name: string;
  readonly tools: readonly HarnessTool[];
}
```

## Related contracts

- [HarnessTool](../harnesstool/)
