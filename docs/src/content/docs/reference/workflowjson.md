---
title: "WorkflowJson"
description: "WorkflowJson — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowJson**. See the [workflow checkpoints guide](../../guide/advanced/checkpoints/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowJson } from "@elie-laloum/outpost";
```

## Purpose and behavior

Persist lossless task results and explicitly reopen the same graph across process restarts.

Completed outputs are not replayed. Interrupted ordinary tasks require retry-incomplete authorization. Outputs must be lossless JSON; full dispatch results contain functions and cannot be checkpointed directly.

[Complete example and detailed rules](../../guide/advanced/checkpoints/).

## Signature

```ts
export type WorkflowJson =
  | null
  | boolean
  | number
  | string
  | readonly WorkflowJson[]
  | {
      readonly [key: string]: WorkflowJson;
    };
```
