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

| Name       | Type                          | Presence | Meaning                                                                                                                                                                                                                               |
| ---------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subagent` | `string \| null \| undefined` | Optional | Built-in subagent run id, read from its subagent event, to deliver only to that run at its next step; null delivers only to the main loop. Omitted, the first active loop receives it. CLI agents reject a target with code steering. |

## Signature

```ts
export interface SteeringSendOptions {
  /** Built-in subagent run id from its `subagent` event; `null` targets only the main loop. */
  readonly subagent?: string | null;
}
```
