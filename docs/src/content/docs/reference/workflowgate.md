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

| Name             | Type                    | Presence | Meaning                                                                                                                                                                                                                                   |
| ---------------- | ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication` | `"signed" \| undefined` | Optional | signed requires every decision to carry a proof accepted by the decisionVerifier; when omitted, the actor named by your application is trusted. Part of checkpoint identity: adding or removing it makes a saved checkpoint incompatible. |
| `kind`           | `"approval" \| "pause"` | Required | approval waits for approve; pause waits for resume. Both accept rejection.                                                                                                                                                                |
| `prompt`         | `string`                | Required | Question put to the actors, copied into the pending request.                                                                                                                                                                              |
| `actors`         | `readonly string[]`     | Required | Names allowed to decide this gate. A signed gate also requires a key bound to the chosen actor.                                                                                                                                           |

## Signature

```ts
export interface WorkflowGate {
  readonly authentication?: "signed";
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}
```
