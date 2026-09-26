---
title: "HarnessToolsetOptions"
description: "HarnessToolsetOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Hooks, permissions, persisted conversations and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessToolsetOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                                                  | Presence | Meaning                                                   |
| ------- | ----------------------------------------------------- | -------- | --------------------------------------------------------- |
| `name`  | `string`                                              | Required | Nonempty name identifying the toolset.                    |
| `tools` | `readonly (HarnessTool<unknown> \| HarnessToolset)[]` | Required | Tools and nested toolsets to group; names must be unique. |

## Signature

```ts
export interface HarnessToolsetOptions {
  readonly name: string;
  readonly tools: readonly (HarnessTool | HarnessToolset)[];
}
```

## Related contracts

- [HarnessTool](../harnesstool/)
- [HarnessToolset](../harnesstoolset/)
