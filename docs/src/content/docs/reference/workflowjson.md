---
title: "WorkflowJson"
description: "WorkflowJson — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowJson } from "@elie-laloum/outpost";
```

## Purpose and behavior

JSON value that round-trips without loss: null, boolean, finite number other than -0, string, array or plain object of these. Used for task cache keys, queue job inputs and results, trigger payloads and interactive task state; checkpoint outputs must have this form or be undefined.

[Complete example and detailed rules](../../guide/durable-runs/).

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
