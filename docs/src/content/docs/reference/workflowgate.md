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

| Name             | Type                    | Presence | Meaning                                                                                                                                             |
| ---------------- | ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication` | `"signed" \| undefined` | Optional | Require signed decisions when set to signed; omitted preserves application-trusted actor metadata. This requirement is part of checkpoint identity. |
| `kind`           | `"approval" \| "pause"` | Required | approval waits for approve; pause waits for resume. Both accept rejection.                                                                          |
| `prompt`         | `string`                | Required | Instruction explaining the approval or pause decision requested from the trusted actor.                                                             |
| `actors`         | `readonly string[]`     | Required | Nonempty list of actors authorized to decide this gate. Signed gates additionally require a verified key bound to the selected actor.               |

## Signature

```ts
export interface WorkflowGate {
  readonly authentication?: "signed";
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}
```
