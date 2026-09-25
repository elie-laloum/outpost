---
title: "WorkflowGate"
description: "WorkflowGate — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowGate } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                    | Presence | Meaning                                                                                                   |
| -------- | ----------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `kind`   | `"approval" \| "pause"` | Required | approval waits for approve; pause waits for resume. Both accept rejection.                                |
| `prompt` | `string`                | Required | Instruction explaining the approval or pause decision requested from the trusted actor.                   |
| `actors` | `readonly string[]`     | Required | Nonempty list of trusted actor names allowed to decide this gate; callers authenticate actors externally. |

## Signature

```ts
export interface WorkflowGate {
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}
```
