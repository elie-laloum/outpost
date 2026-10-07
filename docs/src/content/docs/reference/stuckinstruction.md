---
title: "StuckInstruction"
description: "StuckInstruction — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StuckInstruction } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                  | Presence | Meaning                                                                                                                                                                                                                                                                              |
| ------------------ | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `instruction`      | `string`              | Required | Nonempty literal steering text sent on repetition. No brief expansion is performed. Built-in subagent events target that subagent; CLI instructions use live input when available or stop and resume once a conversation is known. Undelivered instructions fail with code steering. |
| `maxInterventions` | `number \| undefined` | Optional | Positive integer, default 1: total watchdog instructions allowed across resumed turns and response repairs of one execution. Further stuck episodes stop with code stuck. Separate cold passes, fallback candidates and later dispatches have fresh limits.                          |

## Signature

```ts
export interface StuckInstruction {
  readonly instruction: string;
  readonly maxInterventions?: number;
}
```
