---
title: "TruncateToolResultsOptions"
description: "TruncateToolResultsOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TruncateToolResultsOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                  | Presence | Meaning                                                            |
| --------------- | --------------------- | -------- | ------------------------------------------------------------------ |
| `keepRecent`    | `number \| undefined` | Optional | Number of most recent tool-result messages kept intact, default 4. |
| `maxCharacters` | `number \| undefined` | Optional | Length older tool results are cut to, default 2000 characters.     |

## Signature

```ts
export interface TruncateToolResultsOptions {
  readonly keepRecent?: number;
  readonly maxCharacters?: number;
}
```
