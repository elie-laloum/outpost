---
title: "RecipeEnqueueOptions"
description: "RecipeEnqueueOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeEnqueueOptions } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name             | Type                                                  | Presence | Meaning                                                                                                                                       |
| ---------------- | ----------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `queue`          | `string`                                              | Required | Named queue, with an optional queues. prefix; only this queue and its dependencies are prepared.                                              |
| `handler`        | `string`                                              | Required | Trusted handler name registered by a separately started worker.                                                                               |
| `runId`          | `string`                                              | Required | Checkpoint run ID included with the recipe parameters in the native trigger job input.                                                        |
| `id`             | `string \| undefined`                                 | Optional | Explicit queue job ID; defaults to recipe:&lt;handler>:&lt;runId> for deterministic repeated publication.                                     |
| `idempotencyKey` | `string \| undefined`                                 | Optional | Stable effect key when deliberately publishing a distinct job ID for the same effect; persistent destination deduplication remains necessary. |
| `deadline`       | `number \| undefined`                                 | Optional | Absolute epoch millisecond deadline enforced by the selected queue.                                                                           |
| `signal`         | `AbortSignal \| undefined`                            | Optional | Cancel queue preparation before publication; the native enqueue operation has no cancellation parameter.                                      |
| `inputs`         | `Readonly<Record<string, WorkflowJson>> \| undefined` | Optional | Recipe parameter mapping validated and completed with defaults before preparing the queue.                                                    |

## Signature

```ts
export interface RecipeEnqueueOptions extends Pick<
  RecipeRunOptions,
  "inputs" | "signal"
> {
  readonly queue: string;
  readonly handler: string;
  readonly runId: string;
  readonly id?: string;
  readonly idempotencyKey?: string;
  readonly deadline?: number;
}
```

## Related contracts

- [RecipeRunOptions](../reciperunoptions/)
