---
title: "ObservationScope"
description: "ObservationScope — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationScope } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                    |
| ------------- | --------------------- | -------- | -------------------------------------------------------------------------- |
| `executionId` | `string \| undefined` | Optional | Workflow execution identifier, preserved when resuming its checkpoint.     |
| `taskKey`     | `string \| undefined` | Optional | Declared workflow task key producing this event.                           |
| `attempt`     | `number \| undefined` | Optional | Task attempt number; condition evaluation may use zero.                    |
| `dispatchId`  | `string \| undefined` | Optional | Unique identifier for one cold or warm dispatch, shared across its passes. |
| `pass`        | `number \| undefined` | Optional | Agent pass number within the dispatch.                                     |
| `candidate`   | `string \| undefined` | Optional | Declared speculative candidate key.                                        |

## Signature

```ts
export interface ObservationScope {
  readonly executionId?: string;
  readonly taskKey?: string;
  readonly attempt?: number;
  readonly dispatchId?: string;
  readonly pass?: number;
  readonly candidate?: string;
}
```
