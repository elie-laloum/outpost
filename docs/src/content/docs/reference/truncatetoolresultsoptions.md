---
title: "TruncateToolResultsOptions"
description: "TruncateToolResultsOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { TruncateToolResultsOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                  | Presence | Meaning                                                                |
| --------------- | --------------------- | -------- | ---------------------------------------------------------------------- |
| `keepRecent`    | `number \| undefined` | Optional | Number of most recent tool-result messages kept intact; defaults to 4. |
| `maxCharacters` | `number \| undefined` | Optional | Length older tool results are cut to; defaults to 2,000 characters.    |

## Signature

```ts
export interface TruncateToolResultsOptions {
  readonly keepRecent?: number;
  readonly maxCharacters?: number;
}
```
