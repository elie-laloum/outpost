---
title: "defineHarnessToolset"
description: "defineHarnessToolset — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import { defineHarnessToolset } from "@elie-laloum/outpost";
```

## Purpose and behavior

Group tools and nested toolsets under a name so they can be reused across harnesses. Flattens nested sets and rejects duplicate tool names.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name            | Type                                                  | Presence | Meaning                                                   |
| --------------- | ----------------------------------------------------- | -------- | --------------------------------------------------------- |
| `options`       | `HarnessToolsetOptions`                               | Required | Toolset name and the tools or nested toolsets it groups.  |
| `options.name`  | `string`                                              | Required | Nonempty name identifying the toolset.                    |
| `options.tools` | `readonly (HarnessTool<unknown> \| HarnessToolset)[]` | Required | Tools and nested toolsets to group; names must be unique. |

## Returns

`HarnessToolset`

## Signature

```ts
export declare function defineHarnessToolset(
  options: HarnessToolsetOptions,
): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
- [HarnessToolsetOptions](../harnesstoolsetoptions/)
