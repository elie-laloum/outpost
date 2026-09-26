---
title: "ToolResources"
description: "ToolResources — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
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
