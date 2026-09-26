---
title: "ToolResources"
description: "ToolResources — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Streaming is not available yet; the contract may change before release.
:::

## Import

```ts
import type { ToolResources } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                             | Presence | Meaning                                                   |
| --------- | -------------------------------- | -------- | --------------------------------------------------------- |
| `paths`   | `readonly string[] \| undefined` | Optional | Repository-relative paths the call reads or writes.       |
| `command` | `string \| undefined`            | Optional | Command line the call runs, for command permission rules. |

## Signature

```ts
export interface ToolResources {
  readonly paths?: readonly string[];
  readonly command?: string;
}
```
