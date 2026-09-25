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

| Name     | Type                                    | Presence | Meaning                                                                                                   |
| -------- | --------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `key`    | `string`                                | Required | Stable task key identifying the node within its workflow graph.                                           |
| `after`  | `readonly Task<unknown>[] \| undefined` | Optional | Declared task dependencies whose values may be read.                                                      |
| `prompt` | `string`                                | Required | Instruction explaining the approval or pause decision requested from the trusted actor.                   |
| `actors` | `readonly string[]`                     | Required | Nonempty list of trusted actor names allowed to decide this gate; callers authenticate actors externally. |

## Signature

```ts
export interface WorkflowGateOptions {
  readonly key: string;
  readonly after?: readonly Task[];
  readonly prompt: string;
  readonly actors: readonly string[];
}
```

## Related contracts

- [Task](../type-task/)
