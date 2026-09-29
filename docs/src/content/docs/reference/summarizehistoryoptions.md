---
title: "SummarizeHistoryOptions"
description: "SummarizeHistoryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SummarizeHistoryOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                 | Type                  | Presence | Meaning                                                                                                                    |
| -------------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `triggerCharacters`  | `number \| undefined` | Optional | Length of the JSON-serialized history above which a summary is made, default 400000 characters.                            |
| `keepRecentMessages` | `number \| undefined` | Optional | Minimum number of recent messages kept after the summary, default 6; the cut moves back to the previous assistant message. |

## Signature

```ts
export interface SummarizeHistoryOptions {
  readonly triggerCharacters?: number;
  readonly keepRecentMessages?: number;
}
```
