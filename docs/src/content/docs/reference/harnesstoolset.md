---
title: "HarnessToolset"
description: "HarnessToolset — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
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
