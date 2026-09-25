---
title: "WorkflowPauseRequest"
description: "WorkflowPauseRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowPauseRequest } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                    | Presence | Meaning                                                                                                   |
| ------------- | ----------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `id`          | `string`                | Required | Unique ID of this pending gate request; decisions must match it.                                          |
| `requestedAt` | `string`                | Required | ISO timestamp when the gate entered its paused state.                                                     |
| `kind`        | `"approval" \| "pause"` | Required | approval waits for approve; pause waits for resume. Both accept rejection.                                |
| `prompt`      | `string`                | Required | Instruction explaining the approval or pause decision requested from the trusted actor.                   |
| `actors`      | `readonly string[]`     | Required | Nonempty list of trusted actor names allowed to decide this gate; callers authenticate actors externally. |

## Signature

```ts
export interface WorkflowPauseRequest extends WorkflowGate {
  readonly id: string;
  readonly requestedAt: string;
}
```

## Related contracts

- [WorkflowGate](../workflowgate/)
