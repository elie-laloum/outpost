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

| Name             | Type                    | Presence | Meaning                                                                                         |
| ---------------- | ----------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `id`             | `string`                | Required | Random identifier generated when the gate pauses; a decision's requestId must equal it.         |
| `requestedAt`    | `string`                | Required | ISO timestamp when the gate entered its paused state.                                           |
| `authentication` | `"signed" \| undefined` | Optional | Signature requirement copied from the gate into this pending request.                           |
| `kind`           | `"approval" \| "pause"` | Required | approval waits for approve; pause waits for resume. Both accept rejection.                      |
| `prompt`         | `string`                | Required | Question put to the actors, copied into the pending request.                                    |
| `actors`         | `readonly string[]`     | Required | Names allowed to decide this gate. A signed gate also requires a key bound to the chosen actor. |

## Signature

```ts
export interface WorkflowPauseRequest extends WorkflowGate {
  readonly id: string;
  readonly requestedAt: string;
}
```

## Related contracts

- [WorkflowGate](../workflowgate/)
