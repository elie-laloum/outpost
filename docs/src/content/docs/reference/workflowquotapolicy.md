---
title: "WorkflowQuotaPolicy"
description: "WorkflowQuotaPolicy — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowQuotaPolicy } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                                                                                                                                                                      |
| ----------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `action`    | `"pause"`             | Required | Behavior on a quota error; pause is the only supported action.                                                                                                                                               |
| `maxWaitMs` | `number \| undefined` | Optional | Longest wait in milliseconds for a known future reset inside the current start() call; a later or unknown reset leaves the task paused and the workflow returns paused. Nonnegative safe integer, default 0. |

## Signature

```ts
export interface WorkflowQuotaPolicy {
  readonly action: "pause";
  /** Longest in-process wait for a known reset; later resets pause durably. */
  readonly maxWaitMs?: number;
}
```
