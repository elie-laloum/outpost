---
title: "SteeringSendOptions"
description: "SteeringSendOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SteeringSendOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                          | Presence | Meaning                                                                                                                                                                                                                                                                                 |
| ---------- | ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subagent` | `string \| null \| undefined` | Optional | Built-in subagent run id, read from its subagent event, to deliver only to that run at its next step boundary; null to deliver only to the main loop. Omit it to deliver to the first active loop. Instructions for a run that ended, or sent to CLI agents, reject with code steering. |

## Signature

```ts
export interface SteeringSendOptions {
  /** Built-in subagent run id from its `subagent` event; `null` targets only the main loop. */
  readonly subagent?: string | null;
}
```
