---
title: "RunReportFailure"
description: "RunReportFailure — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunReportFailure } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type             | Presence | Meaning                                                                                                                                                           |
| ------------ | ---------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tool`       | `string`         | Required | Tool name from the matched call, then the result, or unknown when neither identifies it.                                                                          |
| `command`    | `string \| null` | Required | String input or command/cmd field from the matched tool call, limited to 4096 characters; null when unavailable. It is a description, never executed by report(). |
| `preview`    | `string`         | Required | Failure preview supplied by the adapter, limited to 4096 characters. May already be an excerpt; no full stdout or stderr is collected.                            |
| `pass`       | `number \| null` | Required | One-based observed pass number, or null when the event had no pass scope.                                                                                         |
| `subagentId` | `string \| null` | Required | Observed subagent identifier, or null for the main agent or an event without subagent scope.                                                                      |

## Signature

```ts
export interface RunReportFailure {
  readonly tool: string;
  readonly command: string | null;
  readonly preview: string;
  readonly pass: number | null;
  readonly subagentId: string | null;
}
```
