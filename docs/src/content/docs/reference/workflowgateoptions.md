---
title: "WorkflowGateOptions"
description: "WorkflowGateOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowGateOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                    | Presence | Meaning                                                                                                                                                |
| ---------------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `authentication` | `"signed" \| undefined`                 | Optional | Set to signed to require a verified Ed25519 proof on every decision for this gate. Stored in the gate and in checkpoint identity.                      |
| `key`            | `string`                                | Required | Task key of the gate, unique in the workflow and named by each decision. Letters, digits, dot, underscore and hyphen, starting with a letter or digit. |
| `after`          | `readonly Task<unknown>[] \| undefined` | Optional | Tasks that must be done before the gate pauses. If one fails or is skipped, cancelled or rejected, the gate is skipped.                                |
| `prompt`         | `string`                                | Required | Question put to the actors, copied into the pending request. A blank prompt throws.                                                                    |
| `actors`         | `readonly string[]`                     | Required | Names allowed to decide the gate: at least one, unique and nonblank. Outpost trusts the actor your application submits unless the gate is signed.      |

## Signature

```ts
export interface WorkflowGateOptions {
  readonly authentication?: "signed";
  readonly key: string;
  readonly after?: readonly Task[];
  readonly prompt: string;
  readonly actors: readonly string[];
}
```

## Related contracts

- [Task](../type-task/)
