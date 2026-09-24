---
title: "WorkflowGate"
description: "WorkflowGate — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowGate**. See the [approval and pause gates guide](../../workflows/approvals/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowGate } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowGate {
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}
```
