---
title: "SummarizeHistoryOptions"
description: "SummarizeHistoryOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { SummarizeHistoryOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                 | Type                  | Presence | Meaning                                                                          |
| -------------------- | --------------------- | -------- | -------------------------------------------------------------------------------- |
| `triggerCharacters`  | `number \| undefined` | Optional | Serialized history size that triggers a summary; defaults to 400,000 characters. |
| `keepRecentMessages` | `number \| undefined` | Optional | Number of recent messages kept after the summary; defaults to 6.                 |

## Signature

```ts
export interface SummarizeHistoryOptions {
  readonly triggerCharacters?: number;
  readonly keepRecentMessages?: number;
}
```
