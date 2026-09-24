---
title: "WorkflowJson"
description: "WorkflowJson — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowJson**. See the [workflow checkpoints guide](../../workflows/checkpoints/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowJson } from "@elie-laloum/outpost";
```

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
