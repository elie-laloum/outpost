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
